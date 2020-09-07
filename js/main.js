"use strick";

// Select buttons
const addTaskBtn = document.querySelector("#add-new-task__button");
const clearCompletedBtn = document.querySelector("#buttons__clear");
const filterBtn = document.querySelector("#buttons__filter");
const darkModeBtn = document.querySelector("#top-section__dark-mode");
const reloadBackgroundBtn = document.querySelector("#top-section__reload");

// Select input value
const newTask = document.querySelector("#add-new-task__input");
const categoryInput = document.querySelector("#add-new-task__category__input");
const urgencyInput = document.querySelector("#add-new-task__urgency__input");

// Select the div where the tasks will go and the templates
const tasksContainer = document.querySelector("#tasks");
const taskListTemplate = document.querySelector("#task-list-template");
const taskTemplate = document.querySelector("#task-template");
const moreMenuTemplate = document.querySelector("#more-menu-template");

// Set the arrays with the categories and levels of urgency
let categoryArray = [];
let urgencyArray = [];

// Set the index of the first task
let id = 1;

// Handling the filter
const filters = ["category", "urgency"];
let filterMode = "";
filterBtn.addEventListener("click", () => {
  if (filterMode == filters[0]) {
    filterMode = filters[1];
    filterBtn.textContent = "Filter by category";
  } else {
    filterMode = filters[0];
    filterBtn.textContent = "Filter by urgency";
  }
});

// Give default value to categoryInput and urgencyInput if they are left empty
function checkInput() {
  if (categoryInput.value == "") {
    categoryInput.value = "Inbox";
  }
  if (urgencyInput.value == "") {
    urgencyInput.value = "None";
  }
}

// Add a task after pressing "Enter"
newTask.addEventListener("keyup", checkValidInput);
categoryInput.addEventListener("keyup", checkValidInput);
urgencyInput.addEventListener("keyup", checkValidInput);

function checkValidInput(e) {
  if (e.keyCode == 13 && newTask.value != "") {
    checkInput();
    addTask(newTask.value, categoryInput.value, urgencyInput.value);
  }
}

// Add a task after pressing the custom + button
addTaskBtn.addEventListener("click", () => {
  if (newTask.value != "") {
    checkInput();
    addTask(newTask.value, categoryInput.value, urgencyInput.value);
  }
});

// Add a task with DOM manipulation
function addTask(taskString, category, urgency, taskCheck = false) {
  // Filling the task template
  const taskTemplateNode = document.importNode(taskTemplate.content, true);
  const copyTaskNode = taskTemplateNode.querySelector("li");
  const checkbox = taskTemplateNode.querySelector("input");
  const label = taskTemplateNode.querySelector("label");
  const cross = taskTemplateNode.querySelectorAll(
    ".task-template__item__cross"
  );

  cross[0].id = id;
  checkbox.id = id;
  label.htmlFor = id;

  copyTaskNode.classList.add(category);
  copyTaskNode.classList.add(urgency);

  addOptionToDatalist(category, "category");
  addOptionToDatalist(urgency, "urgency");

  const pElement = taskTemplateNode.querySelector("p");
  pElement.append(taskString);

  // Based on the filterMode, filling the new list if needed
  const taskListTemplateNode = document.importNode(
    taskListTemplate.content,
    true
  );
  const copyListNode = taskListTemplateNode.querySelector("details");

  // Check if category exists already
  // If not, create it and append it to tasksContainer
  // If yes, do nothing
  if (filterMode == filters[0] && categoryArray.indexOf(category) == -1) {
    // Insert category to existing ones
    categoryArray.push(category);

    // Change title
    const title = copyListNode.querySelector(
      ".task-list-template__details__title"
    );
    title.textContent = category;

    // Add category and urgency to the class of the parentNode
    copyListNode.classList.add(category);

    tasksContainer.append(copyListNode);

    setListenersDots(copyListNode);
  } else if (filterMode == filters[1] && urgencyArray.indexOf(urgency) == -1) {
    // Insert category to existing ones
    urgencyArray.push(urgency);

    // Change title
    const title = copyListNode.querySelector(
      ".task-list-template__details__title"
    );
    title.textContent = urgency;

    // Change title
    const dots = copyListNode.querySelector(
      ".task-list-template__details__button"
    );
    dots.id = urgency;

    // Add category and urgency to the class of the parentNode
    copyListNode.classList.add(urgency);

    tasksContainer.append(copyListNode);

    setListenersDots(copyListNode);
  }

  const allDetails = tasksContainer.querySelectorAll("details");
  // Appending the task in the right category
  if (filterMode == filters[0]) {
    allDetails.forEach((list) => {
      const hasClass = list.classList.contains(category);
      if (hasClass) {
        const ul = list.querySelector("ul");
        ul.append(taskTemplateNode);
        if (list.open != true) {
          list.open = true;
        }
      }
    });
  } else {
    allDetails.forEach((list) => {
      const hasClass = list.classList.contains(urgency);
      if (hasClass) {
        const ul = list.querySelector("ul");
        ul.append(taskTemplateNode);
        if (list.open != true) {
          list.open = true;
        }
      }
    });
  }

  // Making sure that the check animation doesn't restart onload page
  if (taskCheck) {
    const checkCustom = label.querySelector("svg");
    const path = checkCustom.querySelector("path");
    path.style.strokeDashoffset = 0;
    checkbox.checked = taskCheck;
  } else {
    checkbox.checked = taskCheck;
  }

  // Reseting input boxes and incrementing id
  newTask.value = "";
  categoryInput.value = "";
  urgencyInput.value = "";
  id++;

  setListenersCrosses();
  makeElementsDraggable();
}

clearCompletedBtn.addEventListener("click", () => {
  const tasks = document.querySelectorAll(".task-template__item");
  tasks.forEach((task) => {
    const checked = task.querySelector("input").checked;
    if (checked) {
      task.remove();
    }
  });
});

// Adding new option to datalist When new category is inputed
function addOptionToDatalist(userInput, type) {
  // Get current datalist
  const id = `add-new-task__${type}__list`;
  const datalist = document.getElementById(id);
  const options = datalist.querySelectorAll("option");
  const optionsArray = [];

  options.forEach((option) => {
    optionsArray.push(option.value);
  });

  // Check if inputed category already exist. If not, add it
  if (optionsArray.indexOf(userInput) != -1) {
    return;
  } else {
    const newOption = document.createElement("option");
    newOption.value = userInput;
    datalist.appendChild(newOption);
  }
}

// Before closing the tab, load the info on the localStorage
window.addEventListener("beforeunload", () => {
  // Clear previous cache
  localStorage.clear();

  // Set the array where we'll store the objects with task info
  const tasksArray = [];

  const liElements = document.getElementsByTagName("li");

  for (let i = 0; i < liElements.length; i++) {
    // Get check info
    const input = liElements[i].querySelector("input");
    const checkedItem = input.checked;

    // Get task text
    const text = liElements[i].querySelector("p");
    const taskItem = text.outerText;

    // Get category
    const category = liElements[i].classList.item(1);

    // Get urgency
    const urgency = liElements[i].classList.item(2);

    // Put each task in an object and store them in an array
    const allItems = {
      checked: checkedItem,
      task: taskItem,
      category: category,
      urgency: urgency,
    };

    tasksArray.push(allItems);
  }

  localStorage.setItem("tasks", JSON.stringify(tasksArray));
  localStorage.setItem("filterMode", filterMode);
  // localStorage.clear();
});

// Onload, download the info from the localStorage
window.addEventListener("load", () => {
  // Setting the last filterMode used
  filterMode = localStorage.getItem("filterMode");
  if (filterMode == null) {
    filterMode = filters[0];
  }
  if (filterMode == filters[0]) {
    filterBtn.textContent = "Filter by urgency";
  } else {
    filterBtn.textContent = "Filter by category";
  }

  if (localStorage.getItem("tasks") != null) {
    const data = JSON.parse(localStorage.getItem("tasks"));
    data.forEach((item) => {
      addTask(item.task, item.category, item.urgency, item.checked);
    });
  }

  // if (localStorage.length == 1 && data.length == 0) {
  //   addTask("Crush my goals of the month", true);
  //   addTask("Go find Voldemort's nose");
  //   addTask("Date my best friend's little sister");
  // }
});

// Set a mutation observer so that the eventListeners are up to date with the current crosses and the drag-and-drop symbols

// We are only observing if a task (i.e. a li element) gets added or deleted
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutation are observed
const callback = function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type == "childList") {
      // setListenersCrosses();
      // makeElementsDraggable();
    }
  }
};

// Create the observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start checking for DOM tree mutations
observer.observe(tasksContainer, config);

// Set a loop listening to all crosses
function setListenersCrosses() {
  const crossDeleteBtns = document.getElementsByClassName(
    "task-template__item__cross"
  );
  for (let i = 0; i < crossDeleteBtns.length; i++) {
    const cross = crossDeleteBtns[i];
    cross.addEventListener("click", () => {
      const crossId = cross.id;
      const tasks = document.querySelectorAll(".task-template__item");
      tasks.forEach((task) => {
        const inputId = task.querySelector("input").id;
        if (inputId == crossId) {
          task.remove();
        }
      });
    });
  }
}

// Make elements draggable
function makeElementsDraggable() {
  const tasks = document.querySelectorAll(".task-template__item");

  tasks.forEach((task) => {
    // dragLogo is the 6-dots logo representing the UI elements for drag-and-drop
    // Its default behaviour was not logical, so I fixed it
    // It's being called in both startDragStyle and endDragStyle so I'm setting it before so that it doesn't run twice
    const dragLogo = task.querySelector(".task-template__item__drag");

    // Set the style of the task while it's being dragged
    // Handle the behaviour for touch-based devices
    let touchTimeout;

    task.addEventListener("touchstart", (e) => {
      touchTimeout = setTimeout(() => {
        task.draggable = true;
        document.body.classList.add("stop-scroll");
        task.classList.add("task-template__item--dragging");
        dragLogo.classList.add("task-template__item--ongoing-drag");
      }, 200);
    });

    task.addEventListener("touchend", () => {
      clearTimeout(touchTimeout);
      task.draggable = false;
      document.body.classList.remove("stop-scroll");
      task.classList.remove("task-template__item--dragging");
      dragLogo.classList.remove("task-template__item--ongoing-drag");
    });

    // Set the style of the task while it's being dragged
    // Handle the behaviour for mouse-based devices
    task.addEventListener("mousedown", () => {
      task.draggable = true;
    });

    task.addEventListener("dragstart", () => {
      task.classList.add("task-template__item--dragging");
      dragLogo.classList.add("task-template__item--ongoing-drag");
    });

    task.addEventListener("dragend", () => {
      task.classList.remove("task-template__item--dragging");
      dragLogo.classList.remove("task-template__item--ongoing-drag");
      task.draggable = false;
    });
  });
}

// For touch-based devices
tasksContainer.addEventListener("touchmove", (e) => {
  const myLocation = e.targetTouches[0];
  const target = document.elementFromPoint(myLocation.pageX, myLocation.pageY);
  if (target != null) {
    const targetUl = getParentElement(target, "UL");
    if (targetUl.tagName == "UL") {
      e.preventDefault();
      const touchY = e.targetTouches[0].pageY;
      const afterElement = getDragAfterElement(targetUl, touchY);
      const task = document.querySelector(".task-template__item--dragging");
      if (afterElement == null) {
        targetUl.appendChild(task);
      } else {
        targetUl.insertBefore(task, afterElement);
      }
    }
  }
});

// For mouse-based devices
tasksContainer.addEventListener("dragover", (e) => {
  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target != null) {
    const targetUl = getParentElement(target, "UL");
    if (targetUl.tagName == "UL") {
      e.preventDefault();
      const afterElement = getDragAfterElement(targetUl, e.clientY);
      const task = document.querySelector(".task-template__item--dragging");
      if (afterElement == null) {
        targetUl.appendChild(task);
      } else {
        targetUl.insertBefore(task, afterElement);
      }
    }
  }
});

function getParentElement(object, tag) {
  console.log(object);
  if (object.tagName == tag) {
    return object;
  }
  if (object.tagName == "BODY") {
    return {};
  }
  return getParentElement(object.parentElement, tag);
}

// Function that actually returns the tasks over which the user hovers with the dragged element
// Credit to Web Dev Simplified's YouTube channel for this sweet piece of code
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(
      ".task-template__item:not(.task-template__item--dragging)"
    ),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
}

function setListenersDots(node) {
  // Importing the template which is a document fragment
  const moreMenuTemplateNode = document.importNode(
    moreMenuTemplate.content,
    true
  );

  // We need to convert the template into a more convinient format
  const copyMoreMenu = moreMenuTemplateNode.querySelector(
    ".more-menu-template__container__buttons"
  );

  // 1st promise: creating the dots
  const createDots = function (node) {
    return new Promise((resolve) => {
      node.addEventListener("click", (e) => {
        const target = e.target;
        const parent = target.parentElement;
        const classTargeted = "task-list-template__details__button";
        const hasClass = target.classList.contains(classTargeted);

        const placeholder = parent.querySelector(
          ".task-list-template__details__more-menu"
        );

        if (hasClass) {
          // We need to make it appear so that we can take its measures
          // We then set its position
          // We append it with opacity 0 and turn it to 1
          placeholder.appendChild(copyMoreMenu);

          const halfHeight = copyMoreMenu.offsetHeight / 2;
          const yPosition = e.clientY - halfHeight;
          copyMoreMenu.style.top = yPosition + "px";

          // Position more menu on X axis
          const width = copyMoreMenu.offsetWidth;
          const xPosition = e.clientX - width - 10;
          copyMoreMenu.style.left = xPosition + "px";

          // Make it appear
          copyMoreMenu.style.animation = "appear 0.2s forwards ease-in-out";

          resolve({
            node: copyMoreMenu,
            parent: parent,
            xPosition: xPosition,
            yPosition: yPosition + copyMoreMenu.offsetHeight,
            placeholder: placeholder,
          });
        }
      });
    });
  };

  const setRelatedListeners = function (
    copyMoreMenu,
    parent,
    xPosition,
    yPosition,
    placeholder
  ) {
    return new Promise((resolve) => {
      // Listening to each icon
      setListenerBrush(parent, xPosition, yPosition);
      console.log("test");
      console.log(parent);

      setListenerEdit(parent, copyMoreMenu);
      setListenerTrash(parent);
      setListenersCrosses;

      // We are setting the listener for the click outside the menu that will make it go away
      window.addEventListener("mousedown", setListenerExitMoreMenu, true);
      function setListenerExitMoreMenu(e) {
        if (!placeholder.contains(e.target)) {
          placeholder.textContent = "";
        }
      }

      resolve(copyMoreMenu);
    });
  };

  // We want to set everything only after the apparition of the context menu
  createDots(node).then((res) =>
    setRelatedListeners(
      res.node,
      res.parent,
      res.xPosition,
      res.yPosition,
      res.placeholder
    )
  );
}

// Set the colors of the color palette
const colorPaletteTemplateNode = document.importNode(
  moreMenuTemplate.content,
  true
);
const colorPalette = colorPaletteTemplateNode.querySelector(
  ".more-menu-template__container__colors"
);
const colors = colorPalette.querySelectorAll("button");

// Get color from CSS variable
const root = getComputedStyle(document.documentElement);
const darkestColor = root.getPropertyValue("--darkest-color");

const presetColors = [
  { color: darkestColor, used: false },
  { color: "#e63946", used: false },
  { color: "#2a9d8f", used: false },
  { color: "#f4a261", used: false },
  { color: "#a8dadc", used: false },
  { color: "#ffb4a2", used: false },
  { color: "#a5a58d", used: false },
  { color: "#f2cc8f", used: false },
  { color: "#ef476f", used: false },
  { color: "#fee440", used: false },
];
let index = 0;

colors.forEach((color) => {
  color.style.background = presetColors[index].color;
  index++;
});
// console.log(colorPalette);
// console.log(colors);

function setListenerBrush(parent, xPosition, yPosition) {
  const brushIcon = document.querySelector(
    ".more-menu-template__container__color"
  );

  // Set the listener over the brush click
  brushIcon.addEventListener("click", () => {
    // Position palette on X and Y axis
    colorPalette.style.left = xPosition + "px";
    colorPalette.style.top = yPosition - 7 + "px";

    // Get existing color from the bottom border
    const borderStyle = window.getComputedStyle(parent);
    const borderColor = borderStyle.getPropertyValue("border-bottom-color");

    // Format the rectangle that represents the current color
    colors.forEach((color) => {
      rgbColor = color.style.background;
      hexColor = rgbToHex(rgbColor);
      if (hexColor == borderColor) {
        color.style.boxShadow = `0 0 0 3px ${hexColor}44`;
      }
    });

    const placeholder = parent.querySelector(
      ".task-list-template__details__more-menu"
    );
    placeholder.appendChild(colorPalette);

    // Make it appear
    colorPalette.style.animation = "appearColor 0.4s forwards ease-in-out";

    setListenerColors(colorPalette);
  });

  // Set the listener over each color
  function setListenerColors(colorPalette) {
    colorPalette.addEventListener("click", (e) => {
      const target = e.target;
      const classTargeted = "more-menu-template__container__colors__btn";
      const hasClass = target.classList.contains(classTargeted);
      if (hasClass) {
        const pickedColor = target.style.background;

        // Set the stroke with the new color
        console.log(parent);
        parent.style.setProperty("border-bottom-color", pickedColor);

        // Set the checkboxed with the new color
        const details = parent.parentElement;
        const ul = details.querySelector("ul");
        const checkboxes = ul.querySelectorAll(
          ".task-template__item__custom-checkbox"
        );
        checkboxes.forEach((checkbox) => {
          checkbox.style.setProperty("background", pickedColor);
        });
      }
    });
  }
}

function setListenerTrash(node) {
  const trashIcon = document.querySelector(
    ".more-menu-template__container__trash"
  );

  const detailsEl = node.parentElement;
  const classDetailsEl = detailsEl.classList.item(1);
  trashIcon.addEventListener("click", (e) => {
    // Delete the category from array
    if (categoryArray.indexOf(classDetailsEl) != -1) {
      const indexCat = categoryArray.indexOf(classDetailsEl);
      categoryArray.splice(indexCat, 1);
    } else {
      const indexUrg = urgencyArray.indexOf(classDetailsEl);
      urgencyArray.splice(indexUrg, 1);
    }

    // Delete the task group
    detailsEl.remove();
  });
}

function setListenerEdit(node, moreMenu) {
  function createListener(node, moreMenu) {
    return new Promise((resolve) => {
      const editBtn = document.querySelector(
        ".more-menu-template__container__pencil"
      );
      editBtn.addEventListener("click", () => {
        const pElement = node.querySelector("p");

        pElement.setAttribute("contenteditable", true);
        pElement.focus();

        const details = node.parentElement;
        details.addEventListener("click", disableToggle, true);

        moreMenu.remove();

        resolve({ pElement: pElement, details: details });
      });
    });
  }

  function setCheckEditEnd(pElement, details) {
    return new Promise((resolve) => {
      pElement.addEventListener("keydown", (e) => {
        if (e.keyCode == 13) {
          details.removeEventListener("click", disableToggle, true);
          pElement.setAttribute("contenteditable", false);
        }
      });

      window.addEventListener("mousedown", (e) => {
        if (!pElement.contains(e.target)) {
          details.removeEventListener("click", disableToggle, true);
          pElement.setAttribute("contenteditable", false);
        }
      });
      resolve(pElement);
    });
  }

  function disableToggle(event) {
    event.preventDefault();
  }

  createListener(node, moreMenu).then((res) => {
    setCheckEditEnd(res.pElement, res.details);
  });
}

// Accessing the variable
// const color = element.style.getPropertyValue("--darkest-color");

// // Modifying the variable
// element.style.setProperty("--darkest-color", "#e9ecef");

// https://dev.to/ananyaneogi/create-a-dark-light-mode-switch-with-css-variables-34l8

function rgbToHex(rgb) {
  rgb = rgb.toString();
  let a = rgb.split("(")[1].split(")")[0];

  a = a.split(",");

  let b = a.map(function (x) {
    //For each array element
    x = parseInt(x).toString(16); //Convert to a base16 string
    return x.length == 1 ? "0" + x : x; //Add zero if we get only one character
  });

  b = "#" + b.join("");

  return b;
}
