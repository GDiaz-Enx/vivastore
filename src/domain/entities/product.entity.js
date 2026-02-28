/**
 * Product Entity
 * Representa un producto en el dominio de la aplicación
 */
export class Product {
    constructor({ id, title, description, price, imageUrl, category }) {
        this.id = id;
        this.title = title;
        this.description = description || '';
        this.price = price;
        this.imageUrl = imageUrl;
        this.category = category || 'General';
    }

    /**
     * Formatea el precio con símbolo de moneda
     */
    getFormattedPrice() {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(this.price);
    }

    /**
     * Valida que el producto tenga datos mínimos requeridos
     */
    isValid() {
        return this.title && this.price > 0;
    }

    /**
     * Genera mensaje de WhatsApp para consultar por el producto
     */
    getWhatsAppMessage(phoneNumber) {
        const message = `Hola! Me interesa el producto: *${this.title}* - ${this.getFormattedPrice()}`;
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }
}
