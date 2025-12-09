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
			//console.log("o nome precisa estar preenchido!" + valido);
		}else{
			nome_f.value = nome_selecionar.value;
			//console.log("nome selecionado!" + valido);
		}
	}else{
		const {data, error} = await banco
		.from("clientes")
		.select("nome")
		.eq("nome", nome_f.value);
		
		if(data.length > 0){
			//console.log("Cliente já existe");
			return true;
		}
		
		if(error){
			console.log("erro ao encontrar cliente");
		}
		
		const {error: insertError} = await banco
			.from("clientes")
			.insert([{nome: nome_f.value}]);
			console.log("Cliente adicionado");
			
		//console.log("nome preenchido!" + valido);
	}
	
	
	//valida o serviço
	const servico_f = document.getElementById("lista_servicos");
	
	if(servico_f.value == "vazio"){
		valido = false;
		//console.log("serviço precisa ser selecionado!" + valido);
	}else{
		//console.log("serviço selecionado!" + valido);
	}
	
	
	//valida a data e hora
	const data_f = document.getElementById("data");
	const hora_f = document.getElementById("hora");
	
	if(data_f.value.trim() === ""){
		valido = false;
		//console.log("a data precisa ser preenchida!" + valido);
	}else{
		//console.log("data preenchida!" + valido);
	}
	
	if(hora_f.value.trim() === ""){
		valido = false;
		//console.log("a hora precisa ser preenchida!" + valido);
	}else{
		//console.log("hora preenchida!" + valido);
	}
	
	
	//valida a forma de pagamento e parcelas
	const pagamento_f = document.getElementById("lista_pagamento");
	const parcelas_f = document.getElementById("lista_parcelas");
	
	if(pagamento_f.value == "vazio"){
		valido = false;
		//console.log("a forma de pagamento precisa ser preenchida!" + valido);
		console.log("vazio");
	}else if(pagamento_f.value == "credito"){
		//console.log("forma de pagamento preenchida!" + valido);
		//console.log(pagamento.value + " - " + parcelas.value);
	}else{
		parcelas_f.value = "1x";
		//console.log("forma de pagamento preenchida!" + valido);
		//console.log(pagamento.value + " - " + parcelas.value);
	}
	
	
	if(valido == true){
		enviar_valores();
		console.log("enviando para o banco de dados...");
		
		const {data, error} = await banco
			.from("servicos")
			.insert([{nome: nome_f.value, servico: servico_f.value, data: data_f.value, hora: hora_f.value, pagamento: pagamento_f.value, parcelas: parcelas_f.value}]);

		//if(error) return log(error.message)
		console.log(data);
	
	}
	console.log(valido);
}

//envia para o banco de dados os valores preenchidos caso esteja tudo valido
async function enviar_valores(){
}

//Botões
document.getElementById("btn_confirmar").addEventListener("click", function(e){
	e.preventDefault();
	verificar_campos();
});
