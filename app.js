"use strict";

// ============== global variables ============== //
const endpoint =
  "https://luma0001-c50c8-default-rtdb.europe-west1.firebasedatabase.app/";
let posts;

// ============== load and init app ============== //

window.addEventListener("load", initApp);

function initApp() {
  updatePostsGrid(); // update the grid of posts: get and show all posts

  // event listener
  document
    .querySelector("#btn-create-post")
    .addEventListener("click", showCreatePostDialog);

  document
    .querySelector("#dialog-create-post")
    .addEventListener("submit", createPostClicked);

  document
    .querySelector("#form-delete-post")
    .addEventListener("submit", deletePostClicked);

  document
    .querySelector("#input-search")
    .addEventListener("keyup", inputSearch);
  document
    .querySelector("#input-search")
    .addEventListener("search", inputSearch);
}

// ============== events ============== //

function showCreatePostDialog() {
  console.log("Create New Post clicked!");
  document.querySelector("#dialog-create-post").showModal();
}

function createPostClicked(event) {
  event.preventDefault();
  const form = event.target;

  const title = form.title.value;
  const body = form.body.value;
  const image = form.url.value;

  console.log(title);
  console.log(body);
  console.log(image);

  createPost(title, body, image);
  form.reset();
  document.querySelector("#dialog-create-post").close();
}

// ============== posts ============== //

async function updatePostsGrid() {
  posts = await getPosts(); // get posts from rest endpoint and save in global variable
  const sortPostsTitle = posts.sort(sortByTitle);
  const sortPostsBody = posts.sort(sortByBody);
  showPosts(sortPostsTitle); // show all posts (append to the DOM) with posts as argument
}

// Get all posts - HTTP Method: GET
async function getPosts() {
  const response = await fetch(`${endpoint}/posts.json`); // fetch request, (GET)
  const data = await response.json(); // parse JSON to JavaScript
  const posts = prepareData(data); // convert object of object to array of objects
  return posts; // return posts
}

function showPosts(listOfPosts) {
  document.querySelector("#posts").innerHTML = ""; // reset the content of section#posts

  for (const post of listOfPosts) {
    showPost(post); // for every post object in listOfPosts, call showPost
  }
}

function showPost(postObject) {
  const html = /*html*/ `
        <article class="grid-item">
            <img src="${postObject.image}" />
            <h3>${postObject.title}</h3>
            <p>${postObject.body}</p>
            <div class="btns">
                <button class="btn-delete">Delete</button>
                <button class="btn-update">Update</button>
            </div>
        </article>
    `; // html variable to hold generated html in backtick
  document.querySelector("#posts").insertAdjacentHTML("beforeend", html); // append html to the DOM - section#posts

  // add event listeners to .btn-delete and .btn-update
  document
    .querySelector("#posts article:last-child .btn-delete")
    .addEventListener("click", deleteClicked);
  document
    .querySelector("#posts article:last-child .btn-update")
    .addEventListener("click", updateClicked);

  // called when delete button is clicked
  function deleteClicked(event) {
    console.log("Delete button clicked");
    document.querySelector("#dialog-delete-posts-title").textContent =
      postObject.title;

    document
      .querySelector("#form-delete-post")
      .setAttribute("data-id", postObject.id);

    document.querySelector("#dialog-delete-post").showModal();

    document
      .querySelector("#btn-close-dele-post")
      .addEventListener("click", closeDeleteDialog);
  }

  // called when update button is clicked
  function updateClicked(event) {
    console.log("update button clicked");

    const formUpdate = document.querySelector("#form-update-post");
    console.log(formUpdate.updatetitle.value);

    //Sætter ting ind i forms?
    formUpdate.title.value = postObject.title;
    formUpdate.body.value = postObject.body;
    formUpdate.url.value = postObject.img;
    //Sætter det der id som kan ses i konsollen et sted...
    formUpdate.setAttribute("data-id", postObject.id);

    document.querySelector("#dialog-update-post").showModal();
    document
      .querySelector("#form-update-post")
      .addEventListener("submit", updatePostCliked);
  }
}

// Create a new post - HTTP Method: POST
async function createPost(title, body, image) {
  const postObject = { title: title, body: body, image: image };
  const postJSON = JSON.stringify(postObject);

  const postResponse = await fetch(`${endpoint}/posts.json`, {
    method: "POST",
    body: postJSON,
  });
  const postData = await postResponse.json();

  if (postResponse.ok) {
    console.log("ok");
    updatePostsGrid();
  }
}

function closeDeleteDialog() {
  document.querySelector("#dialog-delete-post").close();
}

function deletePostClicked(event) {
  console.log("delete this now");
  const deleteId = event.target.getAttribute("data-id");
  deletePost(deleteId);
}

// Update an existing post - HTTP Method: DELETE
async function deletePost(id) {
  const deleteResponse = await fetch(`${endpoint}/posts/${id}.json`, {
    method: "DELETE",
  });

  if (deleteResponse.ok) {
    console.log("Deleted");
    updatePostsGrid();
  }
}

function updatePostCliked(event) {
  event.preventDefault();

  const form = event.target;
  console.log(form);

  const title = form.title.value;
  const body = form.body.value;
  const image = form.url.value;
  const id = form.getAttribute("data-id");
  updatePost(id, title, body, image);

  document.querySelector("#dialog-update-post").close();
}

// Delete an existing post - HTTP Method: PUT
async function updatePost(id, title, body, image) {
  // post update to update
  // convert the JS object to JSON string.
  const newObject = {
    id: id,
    title: title,
    body: body,
    image: image,
  };

  const jsonObject = JSON.stringify(newObject);
  const postResponse = await fetch(`${endpoint}/posts/${id}.json`, {
    method: "PUT",
    body: jsonObject,
  });

  if (postResponse.ok) {
    updatePostsGrid();
  }
}

// ============== helper function ============== //

// convert object of objects til an array of objects
function prepareData(dataObject) {
  const array = []; // define empty array
  // loop through every key in dataObject
  // the value of every key is an object
  for (const key in dataObject) {
    const object = dataObject[key]; // define object
    object.id = key; // add the key in the prop id
    array.push(object); // add the object to array
  }
  return array; // return array back to "the caller"
}

//

function inputSearch(event) {
  const value = event.target.value;
  console.log(value);
  const postsToShow = searchPosts(value);
  showPosts(postsToShow);
}

function searchPosts(searchValue) {
  const searchVal = searchValue.toLowerCase();
  const results = posts.filter(checkTitle);

  function checkTitle(posts) {
    const title = posts.title.toLowerCase();
    return title.includes(searchVal);
  }
  return results;
}

//Der er ingen rigtig foreskel tror jeg?
function sortByTitle(postA, postB) {
  return postA.title.localeCompare(postB.title);
}

function sortByBody(postA, postB) {
  return postA.body.localeCompare(postB.body);
}
