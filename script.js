const display = document.getElementById("display");
const botones = document.querySelectorAll(".content-buttons button");
const botonClear = document.getElementById("boton-clear");
const botonNegativo = document.getElementById("convertir-a-negativo");

let operacion = "";
let resultadoMostrado = false;
let clearHoldTimeout;

display.value = "0";

botones.forEach((boton) => {
  const valor = boton.textContent;

  if (valor === "AC" || valor === "+/-") return;

  boton.addEventListener("click", () => {
    const operadores = ["+", "-", "*", "/", "%"];
    const ultimo = operacion.slice(-1);

    // Si se acaba de mostrar un resultado:
    if (resultadoMostrado) {
      if (/[0-9.]/.test(valor)) {
        operacion = "";
        display.value = "0";

        if (valor === ".") {
          operacion = "0.";
          display.value = operacion;
          resultadoMostrado = false;
          return;
        }

      } else if (operadores.includes(valor)) {
        operacion = display.value;
      }
      resultadoMostrado = false;
    }

    // Validación para el punto decimal
    if (valor === ".") {
      if (operacion === "" || operadores.includes(ultimo)) return;

      const partes = operacion.split(/[\+\-\*\/\%]/);
      const ultimaParte = partes[partes.length - 1];
      if (ultimaParte.includes(".")) return;
    }

    // Evitar operadores como primer carácter o duplicados
    if (operadores.includes(valor)) {
      if (operacion === "") return;
      if (operadores.includes(ultimo)) return;
    }

    // Evitar ceros múltiples al inicio
    if (valor === "0" && (operacion === "" || operacion === "0")) return;

    // Reemplazar el 0 inicial
    if (display.value === "0" && ![".", "+", "-", "*", "/", "%", "="].includes(valor)) {
      operacion = valor;
    } else if (valor !== "=") {
      operacion += valor;
    }

    // Evaluar operación con %
    if (valor === "=") {
      try {
        let expr = operacion;
        expr = expr.replace(/(\d+(\.\d+)?)%/g, (match, num) => {
          return `(${parseFloat(num)} / 100)`;
        });

        const resultado = eval(expr);
        display.value = resultado;
        operacion = resultado.toString();
        resultadoMostrado = true;
      } catch {
        display.value = "Error";
        operacion = "";
        resultadoMostrado = false;
      }
    } else {
      display.value = operacion;
    }
  });
});

// AC: Borrado corto y largo
botonClear.addEventListener("mousedown", () => {
  clearHoldTimeout = setTimeout(() => {
    operacion = "";
    display.value = "0";
    resultadoMostrado = false;
  }, 500);
});

botonClear.addEventListener("mouseup", () => {
  if (clearHoldTimeout) {
    clearTimeout(clearHoldTimeout);
    if (operacion.length > 0) {
      operacion = operacion.slice(0, -1);
      display.value = operacion || "0";
    }
  }
});

botonClear.addEventListener("mouseleave", () => {
  clearTimeout(clearHoldTimeout);
});

botonNegativo.addEventListener("click", () => {
  if (!operacion) return;

  // Buscar el último número en la operación (puede estar entre paréntesis)
  const match = operacion.match(/(\(-\d+(\.\d+)?\)|\d+(\.\d+)?)(?!.*(\(-\d+(\.\d+)?\)|\d+(\.\d+)?))/);

  if (match) {
    const numeroEncontrado = match[0];
    const inicio = match.index;
    const fin = inicio + numeroEncontrado.length;

    let nuevoNumero = "";

    if (numeroEncontrado.startsWith("(-")) {
      // Si ya está negativo, volverlo positivo
      nuevoNumero = numeroEncontrado.slice(2, -1);
    } else {
      // Si está positivo, volverlo negativo
      nuevoNumero = `(-${numeroEncontrado})`;
    }

    // Construir nueva operación con el número reemplazado
    operacion = operacion.slice(0, inicio) + nuevoNumero + operacion.slice(fin);
    display.value = operacion;
  }
});