/**
 * Cart Drawer Functionality
 * Extracted from theme.js for better performance
 * Loaded on-demand when user interacts with cart
 */

(function() {
  'use strict';

  // Cart Drawer Manager
  const CartDrawer = {
    
    // Open cart drawer
    open: function() {
      const cartDrawer = document.querySelector(".cart-drawer");
      if (cartDrawer) {
        cartDrawer.classList.add("cart-drawer--active");
      }
    },

    // Close cart drawer
    close: function() {
      const cartDrawer = document.querySelector(".cart-drawer");
      if (cartDrawer) {
        cartDrawer.classList.remove("cart-drawer--active");
      }
    },

    // Update cart item counts
    updateItemCounts: function(count) {
      document.querySelectorAll(".cart.cart-icon--basket1 div, .cart.cart-icon--basket2 div, .cart.cart-icon--basket3 div").forEach((el) => {
        el.textContent = count;
      });
    },

    // Remove item from cart
    removeItem: async function(event, button) {
      event.preventDefault();

      try {
        const rootItem = button.closest(".cart-drawer-item");
        const key = rootItem.getAttribute("data-line-item-key");

        const res = await fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates: { [key]: 0 } }),
        });

        const cart = await res.json();
        this.updateItemCounts(cart.item_count);
        await this.updateDrawer();
      } catch (error) {
        console.error("Error removing item:", error);
      }
    },

    // Update cart drawer content
    updateDrawer: async function() {
      try {
        const res = await fetch("/?section_id=cart-drawer");
        const text = await res.text();
        const html = document.createElement("div");
        html.innerHTML = text;

        const newBox = html.querySelector(".cart-drawer").innerHTML;
        const cartDrawer = document.querySelector(".cart-drawer");
        if (cartDrawer) {
          cartDrawer.innerHTML = newBox;
        }

        this.attachListeners();
      } catch (error) {
        console.error("Error updating cart drawer:", error);
      }
    },

    // Change quantity
    changeQuantity: async function(button) {
      try {
        const rootItem = button.closest(".cart-drawer-item");
        const key = rootItem.getAttribute("data-line-item-key");
        const currentQuantity = Number(button.parentElement.querySelector("input").value);
        const isUp = button.classList.contains("cart-drawer-quantity-selector-plus");
        const newQuantity = isUp ? currentQuantity + 1 : currentQuantity - 1;

        if (newQuantity < 0) return;

        const res = await fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates: { [key]: newQuantity } }),
        });

        const cart = await res.json();
        this.updateItemCounts(cart.item_count);
        await this.updateDrawer();
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    },

    // Add to cart
    addToCart: async function(button) {
      const variantID = button.dataset.productVariant;
      const quantity = 1;
      const originalText = button.textContent;
      
      button.textContent = "Đang thêm...";
      button.disabled = true;

      try {
        const res = await fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: variantID, quantity }),
        });

        if (res.ok) {
          const cart = await res.json();
          this.updateItemCounts(cart.item_count);
          await this.updateDrawer();
          this.open();
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      } finally {
        button.textContent = originalText;
        button.disabled = false;
      }
    },

    // Attach event listeners
    attachListeners: function() {
      // Quantity selectors
      document.querySelectorAll(".cart-drawer-quantity-selector button").forEach((button) => {
        button.addEventListener("click", () => this.changeQuantity(button));
      });

      // Remove buttons
      document.querySelectorAll(".cart-drawer-remove-btn").forEach((button) => {
        button.addEventListener("click", (event) => this.removeItem(event, button));
      });

      // Prevent close when clicking inside drawer
      const cartDrawerBox = document.querySelector(".cart-drawer-box");
      if (cartDrawerBox) {
        cartDrawerBox.addEventListener("click", (e) => e.stopPropagation());
      }

      // Close buttons
      document.querySelectorAll(".cart-drawer-header-right-close, .cart-drawer").forEach((el) => {
        el.addEventListener("click", () => this.close());
      });

      // Add to cart buttons
      document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.addToCart(button);
        });
      });
    },

    // Initialize
    init: function() {
      this.attachListeners();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      CartDrawer.init();
    });
  } else {
    CartDrawer.init();
  }

  // Expose to window for external access
  window.CartDrawer = CartDrawer;

})();
