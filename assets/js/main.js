
document.addEventListener("DOMContentLoaded", function(){
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  const links = document.querySelectorAll(".tab-link");
  const panels = document.querySelectorAll(".tab-panel");
  if (links.length){
    links[0].classList.add("active");
    panels[0].classList.add("active");
    links.forEach(link=>{
      link.addEventListener("click", ()=>{
        links.forEach(l=>l.classList.remove("active"));
        panels.forEach(p=>p.classList.remove("active"));
        link.classList.add("active");
        const target = document.querySelector(link.dataset.target);
        if (target) target.classList.add("active");
      });
    });
  }
});
