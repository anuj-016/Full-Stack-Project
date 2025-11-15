fetch("http://localhost:3000/menu")
  .then(res => res.json())
  .then(data => {
    const menuDiv = document.getElementById("menu");
    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("menu-item");
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>Restaurant: ${item.restaurant}</p>
        <p>Price: ₹${item.price}</p>
      `;
      menuDiv.appendChild(div);
    });
  });
