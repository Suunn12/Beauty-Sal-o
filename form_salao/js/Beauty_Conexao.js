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