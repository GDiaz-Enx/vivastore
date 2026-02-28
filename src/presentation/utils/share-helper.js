/**
 * Share Helper
 * Utilidades para capturar y compartir productos
 */

export class ShareHelper {
    /**
     * Detecta si el usuario está en un dispositivo móvil
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Detecta si estamos en modo share (ruta /share o ?mode=share)
     */
    static isShareMode() {
        // Opción 1: Query parameter ?mode=share
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'share') {
            return true;
        }
        
        // Opción 2: Ruta /share o /share/
        if (window.location.pathname.includes('/share')) {
            return true;
        }
        
        return false;
    }

    /**
     * Captura screenshot de una card con márgenes adicionales
     * @param {HTMLElement} cardElement - Elemento de la card a capturar
     * @returns {Promise<Blob>} - Imagen capturada como Blob
     */
    static async captureCard(cardElement) {
        try {
            // Importar html2canvas dinámicamente
            const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm');
            
            console.log('📦 html2canvas cargado');
            
            // Crear un contenedor temporal con márgenes
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0';
            wrapper.style.padding = '50px 30px';
            wrapper.style.backgroundColor = '#F9FAFB';
            wrapper.style.width = `${cardElement.offsetWidth + 60}px`;
            
            // Clonar la card
            const cardClone = cardElement.cloneNode(true);
            
            // Asegurarse de que las imágenes estén cargadas en el clon
            const images = cardClone.querySelectorAll('img');
            images.forEach(img => {
                // Forzar que la imagen se muestre con su src actual
                const src = img.src;
                img.src = src;
                img.style.display = 'block';
            });
            
            wrapper.appendChild(cardClone);
            document.body.appendChild(wrapper);
            
            console.log('📐 Dimensiones wrapper:', {
                width: wrapper.offsetWidth,
                height: wrapper.offsetHeight
            });
            
            // Esperar un momento para que las imágenes se carguen
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Configuración para capturar
            const options = {
                backgroundColor: '#F9FAFB',
                scale: 2,
                logging: true,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: true,
                width: wrapper.offsetWidth,
                height: wrapper.offsetHeight,
                windowWidth: wrapper.offsetWidth,
                windowHeight: wrapper.offsetHeight,
                imageTimeout: 0,
                removeContainer: false
            };

            console.log('⚙️ Opciones html2canvas:', options);

            // Capturar el canvas
            const canvas = await html2canvas.default(wrapper, options);
            
            console.log('✅ Canvas creado:', {
                width: canvas.width,
                height: canvas.height
            });
            
            // Remover el wrapper temporal
            document.body.removeChild(wrapper);
            
            // Convertir canvas a Blob
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        console.log('✅ Blob creado, tamaño:', blob.size);
                        resolve(blob);
                    } else {
                        reject(new Error('Error al crear el blob de la imagen'));
                    }
                }, 'image/png', 1.0);
            });
        } catch (error) {
            console.error('❌ Error al capturar screenshot:', error);
            throw error;
        }
    }

    /**
     * Comparte la imagen usando la Web Share API
     * @param {Blob} imageBlob - Imagen a compartir
     * @param {string} productTitle - Título del producto para el texto compartido
     */
    static async shareImage(imageBlob, productTitle) {
        try {
            // Verificar si la Web Share API está disponible
            if (!navigator.share) {
                throw new Error('Web Share API no disponible');
            }

            // Crear archivo desde el blob
            const file = new File([imageBlob], `${productTitle}.png`, { type: 'image/png' });

            // Verificar si se pueden compartir archivos
            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
                throw new Error('No se pueden compartir archivos en este dispositivo');
            }

            // Compartir
            await navigator.share({
                files: [file],
                title: 'Viva Store',
                text: 'Mirá mas de mis productos en www.vivastorear.com'
            });

            console.log('Imagen compartida exitosamente');
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Usuario canceló el compartir');
            } else {
                console.error('Error al compartir:', error);
                // Fallback: descargar la imagen
                this.downloadImage(imageBlob, productTitle);
            }
        }
    }

    /**
     * Fallback: descarga la imagen si no se puede compartir
     * @param {Blob} imageBlob - Imagen a descargar
     * @param {string} productTitle - Título del producto
     */
    static downloadImage(imageBlob, productTitle) {
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productTitle}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Maneja el click en el botón de consultar en modo share
     * @param {Event} event - Evento del click
     * @param {HTMLElement} cardElement - Elemento de la card
     * @param {string} productTitle - Título del producto
     */
    static async handleShareClick(event, cardElement, productTitle) {
        // Prevenir cualquier comportamiento por defecto
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        const button = event.currentTarget;
        const originalText = button.innerHTML;

        try {
            // Deshabilitar botón temporalmente sin cambiar el texto
            button.disabled = true;
            button.style.opacity = '0.6';
            
            console.log('📸 Iniciando captura en 100ms...');
            
            // Pequeña pausa para que el botón se vea normal antes de capturar
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capturar screenshot
            console.log('📸 Capturando card...');
            const imageBlob = await this.captureCard(cardElement);
            console.log('✅ Card capturada, tamaño:', imageBlob.size);

            // Mostrar indicador de que se está compartiendo
            button.innerHTML = '<span>Compartiendo...</span>';

            // Compartir imagen
            console.log('📤 Compartiendo imagen...');
            await this.shareImage(imageBlob, productTitle);
            console.log('✅ Imagen compartida');

            // Restaurar botón
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
            
            return true; // Éxito
        } catch (error) {
            console.error('❌ Error en handleShareClick:', error);
            
            // Restaurar botón
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
            
            // Mostrar error amigable
            alert('Error al capturar o compartir la imagen. Por favor, intenta de nuevo.');
            
            return false;
        }
    }
}
