function novoElemento(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Barreira(reversa = false) {
  this.elemento = novoElemento("div", "barreira");

  const borda = novoElemento("div", "borda");
  const corpo = novoElemento("div", "corpo");

  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  this.setAltura = (altura) => (corpo.style.height = `${altura}px`);
}

function ParDeBarreiras(altura, abertura, x) {
  this.elemento = novoElemento("div", "par-de-barreiras");

  this.superior = new Barreira(true);
  this.inferior = new Barreira(false);

  this.elemento.appendChild(this.superior.elemento);
  this.elemento.appendChild(this.inferior.elemento);

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura);
    const alturaInferior = altura - abertura - alturaSuperior;
    this.superior.setAltura(alturaSuperior);
    this.inferior.setAltura(alturaInferior);
  };

  this.getX = () => parseInt(this.elemento.style.left.replace("px", ""));
  this.setX = (x) => (this.elemento.style.left = `${x}px`);
  this.getLargura = () => this.elemento.clientWidth;

  this.sortearAbertura();
  this.setX(x);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new ParDeBarreiras(altura, abertura, largura),
    new ParDeBarreiras(altura, abertura, largura + espaco),
    new ParDeBarreiras(altura, abertura, largura + espaco * 2),
    new ParDeBarreiras(altura, abertura, largura + espaco * 3),
  ];

  const deslocamento = 3;
  this.animar = () => {
    this.pares.forEach((par) => {
      par.setX(par.getX() - deslocamento);

      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length);
        par.sortearAbertura();
      }

      const meio = largura / 2;
      const cruzouOMeio =
        par.getX() + deslocamento >= meio && par.getX() < meio;
      cruzouOMeio && notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  let voando = false;

  this.elemento = novoElemento("img", "passaro");
  this.elemento.src = "imgs/passaro.png";

  this.getY = () => parseInt(this.elemento.style.bottom.replace("px", ""));
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

  window.onkeydown = (e) => (voando = true);
  window.onkeyup = (e) => (voando = false);
  window.addEventListener("touchstart", (e) => (voando = true));
  window.addEventListener("touchend", (e) => (voando = false));

  this.animar = () => {
    const novoY = this.getY() + (voando ? 8 : -5);
    const alturaMaxima = alturaJogo - this.elemento.clientHeight;

    if (this.getY() < 0) {
      this.setY(0);
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima);
    } else {
      this.setY(novoY);
    }
  };
  this.setY(alturaJogo / 2);
}

function Progresso() {
  this.elemento = novoElemento("span", "progresso");
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };
  this.atualizarPontos(0);
}

function Recorde() {
  this.elemento = novoElemento("span", "recorde");

  this.atualizarRecorde = (pontuacao, nome) => {
    const recordeAtual = window.localStorage.getItem("recordeAtual");
    if (pontuacao > recordeAtual) {
      window.localStorage.setItem("recordeAtual", pontuacao);
      window.localStorage.setItem("nomeRecordeAtual", nome);
      this.elemento.innerHTML = `${nome}: ${pontuacao}`;
    }
  };

  const recordeAtual = window.localStorage.getItem("recordeAtual");
  const nomeRecordeAtual = window.localStorage.getItem("nomeRecordeAtual");

  if (recordeAtual) {
    this.elemento.innerHTML = `${nomeRecordeAtual}: ${recordeAtual}`;
  } else {
    this.elemento.innerHTML = `${nomeRecordeAtual}: ${recordeAtual}`;
  }
}

function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  a.right = a.left + a.width;
  a.bottom = a.top + a.height;

  b.right = b.left + b.width;
  b.bottom = b.top + b.height;

  const horizontal = a.right >= b.left && b.right >= a.left;
  const vertical = a.bottom >= b.top && b.bottom >= a.top;

  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  let colidiu = false;
  barreiras.pares.forEach((parDeBarreiras) => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento;
      const inferior = parDeBarreiras.inferior.elemento;

      colidiu =
        estaoSobrepostos(passaro.elemento, superior) ||
        estaoSobrepostos(passaro.elemento, inferior);
    }
  });
  return colidiu;
}

function FlappyBird() {
  const recorde = new Recorde();
  let pontos = 0;

  const areaDoJogo = document.querySelector("[wm-flappy]");
  const altura = areaDoJogo.clientHeight;
  const largura = areaDoJogo.clientWidth;

  const progresso = new Progresso();
  const barreiras = new Barreiras(altura, largura, 220, 400, () =>
    progresso.atualizarPontos(++pontos)
  );
  const passaro = new Passaro(altura);

  areaDoJogo.appendChild(progresso.elemento);
  areaDoJogo.appendChild(recorde.elemento);
  areaDoJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

  this.start = (restart = false) => {
    let nomeUsuario = "";
    if (!restart) {
      nomeUsuario = prompt("Informe seu nome", "Seu nome aqui");
      window.localStorage.setItem("nomeJogador", nomeUsuario);
    } else {
      nomeUsuario = window.localStorage.getItem("nomeJogador");
    }

    const temporizador = setInterval(() => {
      barreiras.animar();
      passaro.animar();

      if (colidiu(passaro, barreiras)) {
        const areaDoJogo = document.querySelector("[wm-flappy]");
        recorde.atualizarRecorde(pontos, nomeUsuario);

        clearInterval(temporizador);

        const recomecar = window.confirm("Tentar novamente?");

        if (recomecar) {
          areaDoJogo.innerHTML = "";
          return new FlappyBird().start(true);
        } else {
          areaDoJogo.innerHTML = "";
          return new FlappyBird().start();
        }
      }
    }, 20);
  };
}

new FlappyBird().start();
