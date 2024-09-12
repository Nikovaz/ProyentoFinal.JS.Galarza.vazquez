// Declaración de funciones globales
let localidades = []; // Declarar la variable localidades en el ámbito global

function handleSubmit(event) {
  event.preventDefault();

  // Obtén los valores de los campos del formulario
  const origen = document.getElementById('origen').value;
  const destino = document.getElementById('destino').value;
  const bultos = document.getElementById('bultos').value;
  const peso = document.getElementById('peso').value;
  const largo = document.getElementById('largo').value;
  const alto = document.getElementById('alto').value;
  const ancho = document.getElementById('ancho').value;
  const valorMercancia = document.getElementById('valor-mercancia').value;
  const valorComercialInput = document.querySelector('input[name="valor-comercial"]:checked');

  // Verificar si el elemento con el nombre "valor-comercial" está seleccionado
  let valorComercial;
  if (valorComercialInput) {
    valorComercial = valorComercialInput.value;
  } else {
    Toastify({
      text: "Por favor, seleccione un valor comercial.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
    return;
  }

  // Validación
  if (!origen || !destino || !bultos || !peso || !largo || !alto || !ancho || !valorMercancia || !valorComercial) {
    Toastify({
      text: "Por favor, complete todos los campos del formulario.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
    return;
  }

  // Validación de campos numéricos
  if (isNaN(peso) || isNaN(largo) || isNaN(alto) || isNaN(ancho) || isNaN(valorMercancia)) {
    Toastify({
      text: "Por favor, ingrese solo números en los campos numéricos.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
    return;
  }

  // Crear instancia de CalculadoraEnvio
  const calculadora = new CalculadoraEnvio(origen, destino, peso);
  const costoEnvio = calculadora.calcularCostoEnvio();

  if (costoEnvio !== null) {
    Toastify({
      text: `Costo de envío calculado: $${costoEnvio.toFixed(2)}`,
      duration: 6000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();

    // Agregar la cotización a la tabla
    const tableBody = document.getElementById('cotizacion-body');
    const cotizacionRow = `
        <tr>
            <td>${origen}</td>
            <td>${destino}</td>
            <td>${bultos}</td>
            <td>${peso} Kg</td>
            <td>${largo} cms</td>
            <td>${alto} cms</td>
            <td>${ancho} cms</td>
            <td>${valorMercancia}</td>
            <td>$${costoEnvio.toFixed(2)}</td>
        </tr>
    `;
    tableBody.innerHTML += cotizacionRow;
  } else {
    resultadoElement.innerHTML = 'Localidades no encontradas.';
    Toastify({
      text: "Localidades no encontradas.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
  }
}

// Carga las localidades
fetch('localidad.json')
  .then(response => response.json())
  .then(data => {
    localidades = data; // Asignar el valor a la variable localidades
    const form = document.getElementById('cotizador-form');
    const origenSelect = document.getElementById('origen');
    const destinoSelect = document.getElementById('destino');
    const resultadoElement = document.getElementById('resultado');

    // Carga las localidades en el select
    localidades.forEach(loc => {
      const option = document.createElement('option');
      option.value = loc.text;
      option.text = loc.text;
      origenSelect.add(option);
      destinoSelect.add(option.cloneNode(true));
    });

    // Maneja la acción del formulario
    form.addEventListener('submit', handleSubmit);
  })
  .catch(error => {
    console.error('Error al cargar las localidades:', error);
    Toastify({
      text: "Error al cargar las localidades.",
      duration: 3000,
      gravity: "top", 
      position: "right", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
    }).showToast();
  });
  // Declaración de la clase CalculadoraEnvio
class CalculadoraEnvio {
  constructor(localidadOrigen, localidadDestino, pesoPaquete) {
    this.localidadOrigen = localidadOrigen;
    this.localidadDestino = localidadDestino;
    this.pesoPaquete = pesoPaquete;
  }

  // Método para convertir grados a radianes
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Método para calcular la distancia entre dos puntos dados por sus coordenadas
  calcularDistancia(lat1, lon1, lat2, lon2) {
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    if (a >= 1) {
      return 0; // o cualquier otro valor que desees devolver en este caso
    }

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = CalculadoraEnvio.RADIO_TIERRA * c;
    return distancia;
  }

  // Método para calcular el costo de envío
  calcularCostoEnvio() {
    const localidadOrigen = localidades.find(loc => loc.text === this.localidadOrigen);
    const localidadDestino = localidades.find(loc => loc.text === this.localidadDestino);

    if (localidadOrigen && localidadDestino) {
      const distancia = this.calcularDistancia(localidadOrigen.latitud, localidadOrigen.longitud, localidadDestino.latitud, localidadDestino.longitud);
      const costoPorPeso = CalculadoraEnvio.COSTO_POR_PESO * this.pesoPaquete;
      const costoPorDistancia = CalculadoraEnvio.COSTO_POR_KILOMETRO * distancia;
      const costoEnvio = costoPorPeso + costoPorDistancia;

      return costoEnvio;
    } else {
      return null;
    }
  }
}

// Constantes de la clase CalculadoraEnvio
CalculadoraEnvio.RADIO_TIERRA = 6371; // en kilómetros
CalculadoraEnvio.COSTO_POR_PESO = 0.5; // en dólares por kilogramo
CalculadoraEnvio.COSTO_POR_KILOMETRO = 0.1; // en dólares por kilómetro

// Carga las localidades
fetch('localidad.json')
  .then(response => response.json())
  .then(data => {
    localidades = data; // Asignar el valor a la variable localidades
    const form = document.getElementById('cotizador-form');
    const origenSelect = document.getElementById('origen');
    const destinoSelect = document.getElementById('destino');
    const resultadoElement = document.getElementById('resultado');

    // Carga las localidades en el select
    localidades.forEach(loc => {
      const option = document.createElement('option');
      option.value = loc.text;
      option.text = loc.text;
      origenSelect.add(option);
      destinoSelect.add(option.cloneNode(true));
    });

    // Maneja la acción del formulario
    form.addEventListener('submit', handleSubmit);
  })
  .catch(error => {
    console.error('Error al cargar las localidades:', error);
    Toastify({
      text: "Error al cargar las localidades.",
      duration: 3000,
      gravity: "top", 
      position: "right", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
    }).showToast();
  });

// Función para manejar la acción del formulario
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cotizador-form');
  form.addEventListener('submit', (event) => {
  event.preventDefault();
    // rest of your code
  });
});

  // Obtén los valores de los campos del formulario
  const origen = document.getElementById('origen').value;
  const destino = document.getElementById('destino').value;
  const bultos = document.getElementById('bultos').value;
  const peso = document.getElementById('peso').value;
  const largo = document.getElementById('largo').value;
  const alto = document.getElementById('alto').value;
  const ancho = document.getElementById('ancho').value;
  const valorMercancia = document.getElementById('valor-mercancia').value;
  const valorComercialInput = document.querySelector('input[name="valor-comercial"]:checked');

 function verificarFormulario() {
  // Verificar si el elemento con el nombre "valor-comercial" está seleccionado
  let valorComercial;
  if (valorComercialInput) {
    valorComercial = valorComercialInput.value;
  } else {
    Toastify({
      text: "Por favor, seleccione un valor comercial.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
    return;
  }

  // Validación
  if (!origen || !destino || !bultos || !peso || !largo || !alto || !ancho || !valorMercancia || !valorComercial) {
    Toastify({
      text: "Por favor, complete todos los campos del formulario.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
    return;
  }

  // Validación de campos numéricos
  if (isNaN(peso) || isNaN(largo) || isNaN(alto) || isNaN(ancho) || isNaN(valorMercancia)) {
    Toastify({
      text: "Por favor, ingrese solo números en los campos numéricos.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
    return;
  }

  // Crear instancia de CalculadoraEnvio
  const calculadora = new CalculadoraEnvio(origen, destino, peso);
  const costoEnvio = calculadora.calcularCostoEnvio();

  if (costoEnvio !== null) {
    Toastify({
      text: `Costo de envío calculado: $${costoEnvio.toFixed(2)}`,
      duration: 6000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();

    // Agregar la cotización a la tabla
    const tableBody = document.getElementById('cotizacion-body');
    const cotizacionRow = `
        <tr>
            <td>${origen}</td>
            <td>${destino}</td>
            <td>${bultos}</td>
            <td>${peso} Kg</td>
            <td>${largo} cms</td>
            <td>${alto} cms</td>
            <td>${ancho} cms</td>
            <td>${valorMercancia}</td>
            <td>$${costoEnvio.toFixed(2)}</td>
        </tr>
    `;
    tableBody.innerHTML += cotizacionRow;
  } else {
    Toastify({
      text: "Localidades no encontradas.",
      duration: 3000,
      gravity: "center", 
      position: "center", 
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
      },
      offsetY: 50, 
      offsetX: 0, 
      className: "toast-large", 
    }).showToast();
  }
}