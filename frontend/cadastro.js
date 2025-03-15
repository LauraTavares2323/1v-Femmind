document.getElementById('cadastro').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const username = document.getElementById('user').value;
    const password = document.getElementById('password').value;
  
    fetch('http://localhost:3000/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          alert("Você foi cadastrado");
          window.location.href = "PagPrincipal.html";
        } else {
          alert("Não foi possível realizar seu cadastro");
        }
    })
  
  });