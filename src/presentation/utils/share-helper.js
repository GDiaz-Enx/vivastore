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
            console.log('📍 Card original:', cardElement);
            
            // Ocultar el botón antes de capturar
            const button = cardElement.querySelector('.product-card__button');
            const originalButtonDisplay = button ? button.style.display : '';
            if (button) {
                button.style.display = 'none';
                console.log('🙈 Botón oculto');
            }
            
            // Scroll al elemento para asegurarse de que esté visible
            cardElement.scrollIntoView({ behavior: 'instant', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Precargar todas las imágenes antes de capturar
            const images = cardElement.querySelectorAll('img');
            console.log('🖼️ Precargando imágenes:', images.length);
            
            await Promise.all(Array.from(images).map(img => {
                return new Promise((resolve) => {
                    if (img.complete) {
                        console.log('✅ Imagen ya cargada:', img.src);
                        resolve();
                    } else {
                        img.onload = () => {
                            console.log('✅ Imagen cargada:', img.src);
                            resolve();
                        };
                        img.onerror = () => {
                            console.log('❌ Error al cargar imagen:', img.src);
                            resolve(); // Continuar aunque falle
                        };
                    }
                });
            }));
            
            // Configuración para capturar
            const options = {
                backgroundColor: '#F9FAFB',
                scale: 2,
                logging: true,
                useCORS: false,
                allowTaint: true,
                foreignObjectRendering: false,
                imageTimeout: 15000,
                proxy: undefined,
                onclone: (clonedDoc, clonedElement) => {
                    console.log('🔄 Clonando documento...');
                    // Agregar padding al elemento clonado
                    clonedElement.style.padding = '50px 30px';
                    clonedElement.style.backgroundColor = '#F9FAFB';
                    
                    // Asegurar que el botón esté oculto en el clon también
                    const clonedButton = clonedElement.querySelector('.product-card__button');
                    if (clonedButton) {
                        clonedButton.style.display = 'none';
                    }
                    
                    // Forzar que las imágenes se muestren correctamente
                    const clonedImages = clonedElement.querySelectorAll('img');
                    console.log('🖼️ Imágenes en clon:', clonedImages.length);
                    clonedImages.forEach((img, index) => {
                        console.log(`Imagen ${index}:`, img.src, 'complete:', img.complete);
                        
                        // Forzar estilos para que la imagen sea visible
                        img.style.display = 'block';
                        img.style.opacity = '1';
                        img.style.visibility = 'visible';
                        img.style.position = 'absolute';
                        img.style.top = '0';
                        img.style.left = '0';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        
                        // Remover cualquier transformación
                        img.style.transform = 'none';
                        
                        // Asegurar que mantenga su src
                        if (img.src) {
                            const src = img.src;
                            img.removeAttribute('crossorigin');
                            img.setAttribute('src', src);
                        }
                    });
                    
                    // Asegurar que el contenedor de la imagen también esté correcto
                    const imageContainers = clonedElement.querySelectorAll('.product-card__image-container');
                    imageContainers.forEach(container => {
                        container.style.position = 'relative';
                        container.style.overflow = 'visible';
                        container.style.background = '#F9FAFB';
                    });
                }
            };

            console.log('⚙️ Opciones html2canvas:', options);
            console.log('📸 Iniciando captura...');

            // Capturar el canvas
            const canvas = await html2canvas.default(cardElement, options);
            
            console.log('✅ Canvas creado:', {
                width: canvas.width,
                height: canvas.height,
                hasData: canvas.toDataURL().length > 100
            });
            
            // Restaurar el botón
            if (button) {
                button.style.display = originalButtonDisplay;
                console.log('👁️ Botón restaurado');
            }
            
            // Verificar que el canvas no esté vacío
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let hasContent = false;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] !== 0 || data[i+1] !== 0 || data[i+2] !== 0) {
                    hasContent = true;
                    break;
                }
            }
            
            console.log('🎨 Canvas tiene contenido:', hasContent);
            
            if (!hasContent) {
                throw new Error('El canvas capturado está vacío');
            }
            
            // Convertir canvas a Blob
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob && blob.size > 1000) { // Al menos 1KB
                        console.log('✅ Blob creado, tamaño:', blob.size);
                        resolve(blob);
                    } else {
                        reject(new Error('Blob inválido o muy pequeño'));
                    }
                }, 'image/png', 1.0);
            });
        } catch (error) {
            console.error('❌ Error al capturar screenshot:', error);
            // Restaurar el botón en caso de error
            const button = cardElement.querySelector('.product-card__button');
            if (button) {
                button.style.display = '';
            }
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
