// Scroll Animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
      console.log(entry);
      
      if(entry.isIntersecting) {
          entry.target.classList.add('show')
      } else {
          entry.target.classList.remove('show')
      }
  });
});

const hiddenElements = document.querySelectorAll(".hiddenS")
hiddenElements.forEach((el) => observer.observe(el));




// Code Effect
const codeElement = document.querySelector("#code code");
const codeEffect = document.getElementById("code")
const output = document.getElementById("output");

const codeLine = 'print(noteMahenn)'
let index = 0

function typeLine() {
  if (index < codeLine.length) {  
      codeElement.textContent += codeLine[index];
      index ++
      setTimeout(typeLine, 100);
  } else {
      output.classList.add("visible");
      
      setTimeout(() => {       
          codeElement.textContent = "";
          index = 0
          output.classList.remove("visible");     
          setTimeout(typeLine, 1500);
      }, 1500);
  }
}

typeLine()