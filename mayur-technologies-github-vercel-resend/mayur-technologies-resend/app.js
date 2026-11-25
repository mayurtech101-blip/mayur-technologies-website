const products = [
  {id:"keyboard",name:"Laptop Keyboards",category:"Keyboards",icon:"⌨",desc:"Replacement keyboards for popular laptop brands and models."},
  {id:"lcd",name:"LCD / LED Screens",category:"Displays",icon:"▣",desc:"Laptop display panels in popular sizes and resolutions."},
  {id:"battery",name:"Laptop Batteries",category:"Power",icon:"▰",desc:"Replacement batteries for compatible laptop models."},
  {id:"adapter",name:"Laptop Adapters",category:"Power",icon:"⌁",desc:"Chargers and power adapters for different laptop ranges."},
  {id:"ram",name:"RAM Memory",category:"Memory & Storage",icon:"▥",desc:"Laptop memory upgrades for compatible systems."},
  {id:"ssd",name:"SSD Storage",category:"Memory & Storage",icon:"▤",desc:"Fast storage upgrades for laptops and notebooks."},
  {id:"hinges",name:"Laptop Hinges",category:"Body Parts",icon:"⟷",desc:"Replacement hinge sets for laptop screen assemblies."},
  {id:"casing",name:"Laptop Body & Casing",category:"Body Parts",icon:"▱",desc:"Top covers, palmrests, bottom cases and related parts."},
  {id:"fans",name:"Cooling Fans",category:"Cooling",icon:"✺",desc:"Replacement cooling fans and thermal components."},
  {id:"dcjack",name:"DC Power Jacks",category:"Power",icon:"◉",desc:"Charging ports and DC-in jack assemblies."},
  {id:"touchpad",name:"Touchpads",category:"Input Parts",icon:"▭",desc:"Touchpad and clickpad replacements for laptops."},
  {id:"flex",name:"Display Cables",category:"Cables",icon:"⌁",desc:"LCD/eDP display flex cables and internal connectors."}
];
let cart = [];
let activeCategory = "All";
const categories = ["All", ...new Set(products.map(p=>p.category))];
const grid = document.getElementById("productGrid");
const filters = document.getElementById("filters");
const overlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const count = document.getElementById("cartCount");
document.getElementById("year").textContent = new Date().getFullYear();

function renderFilters(){
  filters.innerHTML = categories.map(c=>`<button class="filter-btn ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
}
function renderProducts(){
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const visible = products.filter(p=>(activeCategory==="All"||p.category===activeCategory) && `${p.name} ${p.category} ${p.desc}`.toLowerCase().includes(q));
  grid.innerHTML = visible.length ? visible.map(p=>`<article class="product-card"><div class="product-icon">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p><button class="add-btn" data-add="${p.id}">+ Add to cart</button></article>`).join("") : `<p class="no-results">No matching products. Try another search.</p>`;
}
function renderCart(){
  count.textContent = cart.length;
  cartItems.innerHTML = cart.length ? cart.map((id,i)=>{const p=products.find(x=>x.id===id);return `<div class="cart-line"><div><b>${p.name}</b><small>${p.category}</small></div><button class="remove-btn" data-remove="${i}">Remove</button></div>`}).join("") : `<p class="empty-cart">Your cart is empty. Add products from the catalogue.</p>`;
}
function openCart(){overlay.hidden=false;document.body.style.overflow="hidden";renderCart()}
function closeCart(){overlay.hidden=true;document.body.style.overflow=""}
filters.addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;renderFilters();renderProducts()});
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;cart.push(b.dataset.add);renderCart();b.textContent="✓ Added";setTimeout(()=>{if(b.isConnected)b.textContent="+ Add to cart"},900)});
document.getElementById("searchInput").addEventListener("input",renderProducts);
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",e=>{if(e.target===overlay)closeCart()});
cartItems.addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(!b)return;cart.splice(Number(b.dataset.remove),1);renderCart()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)closeCart()});

document.getElementById("enquiryForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const form=e.currentTarget, status=document.getElementById("formStatus"), submit=document.getElementById("submitEnquiry");
  if(!cart.length){status.textContent="Please add at least one product to your cart.";return}
  const data=new FormData(form);
  const payload={
    name:String(data.get("name")||"").trim(),
    mobile:String(data.get("mobile")||"").trim(),
    email:String(data.get("email")||"").trim(),
    laptopModel:String(data.get("laptopModel")||"").trim(),
    message:String(data.get("message")||"").trim(),
    website:String(data.get("website")||""),
    items:cart.map(id=>{const p=products.find(x=>x.id===id);return {name:p.name,category:p.category}})
  };
  submit.disabled=true;submit.textContent="Sending...";status.textContent="Sending your enquiry securely...";
  try{
    const response=await fetch("/api/send-enquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(result.error||"Could not send enquiry. Please try again.");
    status.textContent="Thank you! Your enquiry has been sent. Mayur Technologies will contact you soon.";
    form.reset();cart=[];renderCart();count.textContent="0";
  }catch(err){status.textContent=err.message||"Something went wrong. Please try again."}
  finally{submit.disabled=false;submit.textContent="Send enquiry"}
});
renderFilters();renderProducts();renderCart();
