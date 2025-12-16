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

//------------------------------------------------------------------------------------------------------

//Resgata os nomes de "Clientes" do banco
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

//------------------------------------------------------------------------------------------------------

//Verifica os campos do formulário de serviços e envia para o banco de dados
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
		//console.log(data);
	
	}else{
		alert("Os campos precisam estar preenchidos!");
	}
	//console.log(valido);
	
	nome_f.value = "";
}

//------------------------------------------------------------------------------------------------------

//Formatar mês para formato em extenso

function formatar_mes_ano(mesAno){
	const mesFmt = new Date(mesAno);
	
	const meses = [
        "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
        "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
	];
	
	return `${meses[mesFmt.getMonth()]} de ${mesFmt.getFullYear()}`;
}

//------------------------------------------------------------------------------------------------------

//Carregar os anos dentro da escolha para métricas
const servico_por_ano = {};

function carregar_lista_anos(){
	const lista_anos = document.getElementById("lista_anos");
	lista_anos.innerHTML = "";
	
	const anos = Object.keys(servico_por_ano).sort();
	
	anos.forEach(ano => {
		const selecao_ano = document.createElement("option");
		selecao_ano.value = ano;
		selecao_ano.textContent = ano;
		selecao_ano.id = "selecao_ano";
		lista_anos.appendChild(selecao_ano);
	});
	
	lista_anos.value = anos[0];
	atualizar_graficos(lista_anos.value);
	
	lista_anos.onchange = (e) => {
		console.log("oie");
		atualizar_graficos(e.target.value);
		
	}
}

//------------------------------------------------------------------------------------------------------

//Contar servicos no ano
function contar_no_ano(servicos_no_ano){
	const meses_no_ano = Array(12).fill(0);
	
	servicos_no_ano.forEach(s => {
		const mes_no_ano = new Date(s.data).getMonth();
		meses_no_ano[mes_no_ano]++;
	});
	
	return meses_no_ano;
	
}

//------------------------------------------------------------------------------------------------------

//Atualiza o grafico com o ano selecionado
function atualizar_graficos(ano_selecionado){
	const servicos_ao_ano = servico_por_ano[ano_selecionado];
	const servicos_por_mes = contar_no_ano(servicos_ao_ano);
	
	console.log(ano_selecionado);
	
	graficoMeses.data.datasets[0].data = servicos_por_mes;
	graficoMeses.update();
}

//------------------------------------------------------------------------------------------------------

//Listar servicos na tabela de resumo
const tabela_r = document.getElementById("tabela");

let form_credito = 0;
let form_debito = 0;
let form_dinheiro = 0;
let form_pix = 0;
let form_outro = 0;

let servicos_data = [];

async function resumir_tabela(){
	
	const{data, error} = await banco
		.from("servicos")
		.select("id, nome, servico, data, hora, pagamento, parcelas")
		.order("data", {ascending: true});
	
	let ultimoMes = "";
	
	data.forEach(item => {
		const mesAtual = formatar_mes_ano(item.data);
		const ano = new Date(item.data).getFullYear();
		
		if(mesAtual !== ultimoMes){
			//console.log("formatando...");
			ultimoMes = mesAtual;
			
			const separador = document.createElement("tr");
			
			const linha_mes_ano = document.createElement("th");
			linha_mes_ano.textContent = mesAtual;
			linha_mes_ano.classList.add("tabela_linha");
			linha_mes_ano.classList.add("Titem0");
			
			tabela.appendChild(separador);
			separador.appendChild(linha_mes_ano);
		}
		
		
		
		if(!servico_por_ano[ano]){
			servico_por_ano[ano] = [];
		}
		
		servico_por_ano[ano].push(item);
		
		
		
		
		const coluna = document.createElement("tr");
		coluna.id = item.id;

		const linha_nome = document.createElement("th");
		const linha_servico = document.createElement("th");
		const linha_data = document.createElement("th");
		const linha_hora = document.createElement("th");
		const linha_pagamento = document.createElement("th");
		const linha_parcelas = document.createElement("th");
		
		const btn_apagar = document.createElement("button");
		
		btn_apagar.addEventListener("click", async () => {
			const id = btn_apagar.id;
			
			const confirmar = confirm("Deseja apagar esse registro de serviço?");
			
			if(!confirmar) return;
			
			const {error} = await banco
				.from("servicos")
				.delete()
				.eq("id", id);
				
			
				
			if(error){
				console.error("Erro ao apagar", error);
				alert("Erro ao apagar");
				return;
			}
			
			alert("Apagado com sucesso!");
			location.reload();
			
		});
		
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
		if(item.pagamento == "credito"){
			form_credito ++;
		}else if(item.pagamento == "debito"){
			form_debito ++;
			
		}else if(item.pagamento == "dinheiro"){
			form_dinheiro ++;
			
		}else if(item.pagamento == "pix"){
			form_pix ++;
			
		}else if(item.pagamento == "outro"){
			form_outro ++;
			
		}
		
		linha_parcelas.textContent = item.parcelas;
		linha_parcelas.classList.add("tabela_linha");
		linha_parcelas.classList.add("Titem6");
		
		btn_apagar.textContent = "Apagar 🗑️";
		btn_apagar.classList.add("btn_apagar", "Titem7");
		btn_apagar.id = item.id;
		
		
		tabela.appendChild(coluna);
		coluna.appendChild(linha_nome);
		coluna.appendChild(linha_servico);
		coluna.appendChild(linha_data);
		coluna.appendChild(linha_hora);
		coluna.appendChild(linha_pagamento);
		coluna.appendChild(linha_parcelas);
		coluna.appendChild(btn_apagar);
	});
	
	carregar_grafico();
	carregar_lista_anos();
}

resumir_tabela();

//------------------------------------------------------------------------------------------------------

//Cria os graficos
let graficoMeses = null;

function carregar_grafico(){
	const grafico = document.getElementById("MeuGrafico");
	const grafico2 = document.getElementById("MeuGrafico2");
	
	//Movimentos do mes
	graficoMeses = new Chart(grafico, {
		type: 'bar',
		data:{
			labels: [
				"Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
				"Jul", "Ago", "Set", "Out", "Nov", "Dez"],
			datasets: [{
				label: 'Serviços por mês',
				data:[],
				backgroundColor: ['#be9b7b']
			}]
		},
		options: {
			responsive: false,
			maintainAspectRatio: false,
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						stepSize: 1,
						precision: 0
					}
				}
			}
		}
	});
	
	//Forma de pagamento
	new Chart(grafico2, {
		type: 'bar',
		data:{
			labels: ["Credito","Debito","Dinheiro","Pix","Outro"],
			datasets: [{
				label: 'Forma de pagamento',
				data: [form_credito, form_debito, form_dinheiro, form_pix, form_outro],
				backgroundColor: ['#71c7ec', '#e39e54', '#c9df8a', '#d896ff', '#ff6f69']
			}]
		},
		options: {
			responsive: false,
			maintainAspectRatio: false,
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						stepSize: 1,
						precision: 0
					}
				}
			}
		}
	});
}

//------------------------------------------------------------------------------------------------------

//console.log(servico_por_ano);

//Botões
document.getElementById("btn_confirmar").addEventListener("click", function(e){
	e.preventDefault();
	verificar_campos();
});

document.getElementById("lista_anos").addEventListener("change", e =>{
	atualizar_graficos(e.target.value);
	console.log("oi");
});