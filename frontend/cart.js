
// cart helper - add this to pages if needed
function addToCart(name, price, description){ var cart = JSON.parse(localStorage.getItem('cart')||'[]'); var found = cart.find(function(c){ return c.name===name; }); if(found){ found.qty += 1; } else { cart.push({ name: name, price: price, description: description||'', qty:1 }); } localStorage.setItem('cart', JSON.stringify(cart)); if(document.getElementById('cartCount')) document.getElementById('cartCount').textContent = JSON.parse(localStorage.getItem('cart')||'[]').length; }
