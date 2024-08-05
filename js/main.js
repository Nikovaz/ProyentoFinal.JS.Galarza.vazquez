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
      event.preventDefault(); // Evita que el formulario se envíe

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

      // Clase CalculadoraEnvio
      class CalculadoraEnvio {
        static RADIO_TIERRA = 6371; // Radio de la Tierra en kilómetros
        static COSTO_POR_KILOMETRO = 200; // Costo fijo por kilómetro
        static COSTO_POR_PESO = 2500; // Costo por peso del paquete

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

            return costoEnvio; // Devolvemos el costo total
          } else {
            return null; // Localidades no encontradas
          }
        }
      }

      const calculadora = new CalculadoraEnvio(origen, destino, peso);
      const costoEnvio = calculadora.calcularCostoEnvio();

      if (costoEnvio!== null) {
        resultadoElement.innerHTML = `Costo de envío: $${costoEnvio.toFixed(2)}`;
      } else {
        resultadoElement.innerHTML = 'Localidades no encontradas.';
      }
    }
  });