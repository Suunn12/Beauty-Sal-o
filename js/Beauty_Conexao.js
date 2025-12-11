//Cria a conexão
const SUPABASE_URL = "https://jebltevthtldornlcgvu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplYmx0ZXZ0aHRsZG9ybmxjZ3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NTIwODksImV4cCI6MjA4MDUyODA4OX0.eIuIL7nT5hBmdZB4m283w_dAe2M5RKVCJfbMKg0D-oI";

const banco = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

//Testa a conexão
async function testar_conexao(){
	const{data, error} = await banco.from("clientes").select("id").order("nome", { ascending: true });
	
	if(error){
		console.log("Falha ao conectar: " + error.message);
		console.error(error);
	}else{
		console.log("Conexao estabelecida");
	}
}

testar_conexao();











//Resgata os valores do banco
const lista_nomes = document.getElementById("lista_nomes");

async function carregar_nomes(){
	const{data, error} = await banco.from("clientes").select("nome");
	
	data.forEach(item => {
		const opt = document.createElement("option");
		opt.value = item.nome;
		opt.textContent = item.nome;
		lista_nomes.appendChild(opt);
	});
}

carregar_nomes();










//Verifica os campos do formulário de serviços
async function verificar_campos(){
	let valido = true;
	
	//valida o nome - Caixa de texto
	const nome_f = document.getElementById("nome");
	const nome_selecionar = document.getElementById("lista_nomes");
	
	if(nome_f.value.trim() === ""){
		//valida o nome - Caixa de lista
		if(lista_nomes.value == "vazio"){
			valido = false;
		}else{
			nome_f.value = nome_selecionar.value;
		}
	}else{
		const {data, error} = await banco
		.from("clientes")
		.select("nome")
		.eq("nome", nome_f.value);
		
		if(data.length > 0){
			return true;
			//console.log("Cliente encontrado");
		}
		
		if(error){
			//console.log("erro ao encontrar cliente");
		}
		
		const {error: insertError} = await banco
			.from("clientes")
			.insert([{nome: nome_f.value}]);
			//console.log("Cliente adicionado");
			
	}
	
	
	//valida o serviço
	const servico_f = document.getElementById("lista_servicos");
	
	if(servico_f.value == "vazio"){
		valido = false;
	}
	
	//valida a data e hora
	const data_f = document.getElementById("data");
	const hora_f = document.getElementById("hora");
	
	if(data_f.value.trim() === ""){
		valido = false;
	}
	
	if(hora_f.value.trim() === ""){
		valido = false;
	}
	
	
	//valida a forma de pagamento e parcelas
	const pagamento_f = document.getElementById("lista_pagamento");
	const parcelas_f = document.getElementById("lista_parcelas");
	
	if(pagamento_f.value == "vazio"){
		valido = false;
	}else if(pagamento_f.value == "credito"){
		//console.log(pagamento.value + " - " + parcelas.value);
	}else{
		parcelas_f.value = "1x";
	}
	
	
	if(valido == true){
		const {data, error} = await banco
			.from("servicos")
			.insert([{nome: nome_f.value, servico: servico_f.value, data: data_f.value, hora: hora_f.value, pagamento: pagamento_f.value, parcelas: parcelas_f.value}]);
		
		alert("Enviado com sucesso!");

		//if(error) return log(error.message)
		console.log(data);
	
	}else{
		alert("Os campos precisam estar preenchidos!");
	}
	console.log(valido);
	
	nome_f.value = "";
}











//Formatar mês para formato em extenso
function formatar_mes_ano(mesAno){
	const mesFmt = new Date(mesAno);
	
	const meses = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
	];
	
	return `${meses[mesFmt.getMonth()]} de ${mesFmt.getFullYear()}`;
}









//Listar servicos na tabela de resumo
const tabela_r = document.getElementById("tabela");

async function resumir_tabela(){
	const{data, error} = await banco
		.from("servicos")
		.select("id, nome, servico, data, hora, pagamento, parcelas")
		.order("data", {ascending: true});
	
	let ultimoMes = "";
	
	data.forEach(item => {
		const mesAtual = formatar_mes_ano(item.data);
		
		console.log(item.data);
		
		if(mesAtual !== ultimoMes){
			console.log("formatando...");
			ultimoMes = mesAtual;
			
			const separador = document.createElement("tr");
			
			const linha_mes_ano = document.createElement("th");
			linha_mes_ano.textContent = mesAtual;
			linha_mes_ano.classList.add("tabela_linha");
			linha_mes_ano.classList.add("Titem0");
			
			tabela.appendChild(separador);
			separador.appendChild(linha_mes_ano);
		}
		
		
		
		const coluna = document.createElement("tr");
		coluna.id = item.id;

		const linha_nome = document.createElement("th");
		const linha_servico = document.createElement("th");
		const linha_data = document.createElement("th");
		const linha_hora = document.createElement("th");
		const linha_pagamento = document.createElement("th");
		const linha_parcelas = document.createElement("th");
		
		linha_nome.textContent = item.nome;
		linha_nome.classList.add("tabela_linha");
		linha_nome.classList.add("Titem1");
		
		linha_servico.textContent = item.servico;
		linha_servico.classList.add("tabela_linha");
		linha_servico.classList.add("Titem2");
		
		linha_data.textContent = item.data;
		linha_data.classList.add("tabela_linha");
		linha_data.classList.add("Titem3");
		
		linha_hora.textContent = item.hora;
		linha_hora.classList.add("tabela_linha");
		linha_hora.classList.add("Titem4");
		
		linha_pagamento.textContent = item.pagamento;
		linha_pagamento.classList.add("tabela_linha");
		linha_pagamento.classList.add("Titem5");
		
		linha_parcelas.textContent = item.parcelas;
		linha_parcelas.classList.add("tabela_linha");
		linha_parcelas.classList.add("Titem6");
		
		
		tabela.appendChild(coluna);
		coluna.appendChild(linha_nome);
		coluna.appendChild(linha_servico);
		coluna.appendChild(linha_data);
		coluna.appendChild(linha_hora);
		coluna.appendChild(linha_pagamento);
		coluna.appendChild(linha_parcelas);
	});
}

resumir_tabela();














//Botões
document.getElementById("btn_confirmar").addEventListener("click", function(e){
	e.preventDefault();
	verificar_campos();
});
