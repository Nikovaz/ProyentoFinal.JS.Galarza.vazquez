fetch('localidad.json')
  .then(response => response.json())
  .then(data => {
    const localidades = data;
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

    function handleSubmit(event) {
      event.preventDefault();

      // Obtén los valores de los campos del formulario
      const origen = origenSelect.value;
      const destino = destinoSelect.value;
      const bultos = document.getElementById('bultos').value;
      const peso = document.getElementById('peso').value;
      const largo = document.getElementById('largo').value;
      const alto = document.getElementById('alto').value;
      const ancho = document.getElementById('ancho').value;
      const valorMercancia = document.getElementById('valor-mercancia').value;
      const valorComercial = document.querySelector('input[name="valor-comercial"]:checked').value;

      class CalculadoraEnvio {
        static RADIO_TIERRA = 6371; 
        static COSTO_POR_KILOMETRO = 200;
        static COSTO_POR_PESO = 2500; 

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
