# Technical Interview Preparation Guide (Q&A)

This guide contains **25 essential interview questions and answers** tailored for freshers and 6-month interns based on the architecture, implementation details, and recent updates made to this Pharmacy and Healthcare platform.

---

## Category 1: Project Architecture & Flow

### Q1: Can you explain the overall architecture of your Pharmacy and Healthcare platform?
**Answer:** The project follows a decoupled client-server architecture:
1. **Frontend**: Built using **Next.js** (App Router) with **React 19**, **TypeScript**, and **Tailwind CSS**. It communicates with the backend via REST APIs (using Axios) and establishes a WebSockets connection (using Socket.io-client) for real-time updates.
2. **Backend**: A **Node.js** and **Express** server that exposes RESTful endpoints for authentication, order placement, product details, and image uploads.
3. **Database**: **MongoDB** using **Mongoose** as the ODM (Object Document Mapper) to model data schemas (Products, Lab Tests, Orders, Users).

---

### Q2: How does the data flow when a user adds a medicine to the cart and places an order?
**Answer:** 
1. The user clicks **"ADD"** on a medicine. The click handler triggers `addToCart` in the `CartContext`, which updates the client state and serializes the updated list to `localStorage` for session persistence.
2. On the `/cart` page, the user fills out the Shipping Details form (Name, Phone, Address) and clicks **"Place Order"**.
3. A `POST` request is sent to the backend `/api/orders` endpoint containing the checkout details, items array, total amount, and the logged-in user's username.
4. The backend validates the payload, saves the order record in MongoDB, and triggers a Socket.io broadcast event (`new-order`) to notify the connected Admin and User Dashboards.
5. Finally, the frontend clears the cart state and `localStorage`, and notifies the user of a successful checkout.

---

### Q3: Why did you use Next.js on the frontend instead of vanilla React?
**Answer:** Next.js provides several production-ready features out of the box that vanilla React (via Create React App or Vite) does not:
* **Server-Side Rendering (SSR) & Static Site Generation (SSG)**: Improves initial load performance and search engine optimization (SEO).
* **App Router**: Offers clean, file-system-based routing with support for nested layouts, loading states, and error boundary wrappers.
* **Optimized Components**: Built-in optimization components like `next/image` handle layout shifts and compress images automatically.
* **Serverless Compatibility**: Next.js is optimized to run as serverless functions on platforms like Vercel.

---

### Q4: How do the frontend and backend communicate? Explain the API and real-time synchronization layers.
**Answer:** Communication happens in two ways:
1. **REST APIs (HTTP/Axios)**: Used for request-response cycles, such as signing in, retrieving product lists, booking lab tests, and submitting orders.
2. **WebSockets (Socket.io)**: Used for real-time bi-directional communication. When database states change (e.g., a product is added, or an order status is updated by the admin), the server emits socket events. The client listens to these events and refreshes the lists or triggers status progress updates instantly without reloading the browser.

---

### Q5: How did you deploy this project, and what configurations were necessary for production?
**Answer:** 
* **Frontend**: Deployed on **Vercel**. We set the root directory configuration, created a `vercel.json` file to manage custom install (`cd frontend && npm install`) and build (`cd frontend && npm run build`) triggers, and injected production environment variables.
* **Backend**: Deployed on **Render** (or equivalent cloud environment) with persistent environment variables (like `MONGO_URI` and `PORT`).
* **Configurations**: We had to configure Next.js Remote Patterns for the image loader to allow the production backend domain and localhost to serve static product images safely.

---

## Category 2: Frontend & React 19 / Next.js

### Q6: Why and how did you implement shopping cart persistence? How did you avoid hydration mismatches in Next.js?
**Answer:** 
* **Why**: To prevent the user from losing their cart items when they refresh the page or navigate away.
* **How**: We integrated `localStorage` read/write operations inside the `CartContext`.
* **Avoiding Mismatch**: Next.js runs the first render pass on the server (where `localStorage` is undefined) and then hydates on the client. Reading `localStorage` during initial state setup will cause a Hydration Mismatch error. To avoid this, we initialize the cart state as empty (`[]`), and load the stored items inside a client-side `useEffect` hook, which runs *only* after the component has mounted on the client.

---

### Q7: How does the real-time search box in the header work, and how is it synchronized with the home page search box?
**Answer:** 
1. **Scroll-Driven Animation**: The header detects scrolling via a scroll event listener. If `window.scrollY > 250`, the header search input transitions into view using Tailwind animations (`opacity-100 translate-y-0 scale-100`).
2. **Query Synchronization**: We implemented a custom window event (`sync-search`). When a user types in either the homepage search box or the header search box, the change emits the query string to sync both inputs instantly.
3. **Execution**: Pressing enter triggers a search. If the user is on the homepage, it updates the search list. If on another page, it redirects the user to the home page with a `?q=` query parameter, which the home page parses on mount to fetch results immediately.

---

### Q8: Why did you set a fixed height and layout for the product cards? What issue did this solve?
**Answer:** 
* **The Issue**: Products with longer titles (e.g., *Pantoprazole (Antacid/Gas)* vs. *Dolo*) caused product card heights to stretch unevenly. In horizontal flex containers, this led to misaligned layout heights, broken lines, and misaligned "ADD" buttons.
* **The Solution**: We restructured the cards with fixed dimensions: a width of `w-64` and height of `h-[380px]` with `flex flex-col` layout. We fixed the title wrapper to `h-12 line-clamp-2` (2 lines of text) and utilized `mt-auto` on the bottom section so the pricing and "ADD" buttons are always perfectly aligned at the bottom across all cards.

---

### Q9: Explain how you configured the `next/image` component to display product images safely.
**Answer:** Next.js restricts loading external images to prevent security exploits like cross-site scripting (XSS). To allow images from our backend server, we added matching configurations under `remotePatterns` in [next.config.ts](file:///d:/pharmacy/frontend/next.config.ts):
```typescript
remotePatterns: [
  { protocol: "http", hostname: "localhost", port: "5000", pathname: "/uploads/**" },
  { protocol: "https", hostname: "pharmacy1-bn08.onrender.com", pathname: "/uploads/**" },
  { protocol: "https", hostname: "healthcare-czr7.onrender.com", pathname: "/uploads/**" }
]
```
This allowed images to resolve safely from both local dev and production backend databases.

---

### Q10: What is the purpose of the `middleware.ts` file in your Next.js application?
**Answer:** The `middleware.ts` file is configured with Clerk (or route matching) to intercept incoming requests before they complete. It enforces authentication, protects private routes (like `/admin` or `/dashboard`), and logs request paths. We also configured it to bypass Next.js internal files (`/_next/`) and static assets (images, CSS) to maintain performance.

---

### Q11: Explain how the checkout shipping form is linked to the authenticated user.
**Answer:** We import the `useUser` hook from the `UserContext` inside the checkout components. When the form is submitted, the logged-in user's `username` is added as a payload field (`username: user?.username || ""`) to the request. The backend saves this field to MongoDB. When loading the User Dashboard, the backend queries the database for all orders matching this username.

---

### Q12: How did you style the Doctor and Lab Test pages to maintain design consistency?
**Answer:** We replaced the generic default styling with the project's **Premium Teal Theme**. We created card-based selection grids using cards styled with light teal borders, glassmorphic headers, and hover transformation scale animations (`transform hover:-translate-y-1 hover:scale-[1.02]`). We also added custom emojis/icons and short descriptions for each speciality and test package to make them highly interactive.

---

### Q13: How does the order tracking timeline on the User Dashboard get updated dynamically?
**Answer:** 
1. The User Dashboard page connects to the Socket.io server on mount.
2. It listens to the `"order-updated"` event broadcasted by the backend.
3. Whenever the Admin dashboard updates an order status (e.g., changes status from "Pending" to "Shipped"), the backend emits this socket event.
4. The client receives the event and automatically triggers a fresh API fetch to get updated data, updating the visual progress bar width (`Pending = 10%`, `Accepted = 50%`, `Shipped = 80%`, `Delivered = 100%`) without needing a page refresh.

---

## Category 3: Backend & Socket.io / Node.js

### Q14: How did you secure your MongoDB credentials on the backend? Why is it bad practice to hardcode connection strings?
**Answer:** 
* **The Fix**: We created a `.env` file at the backend root directory containing `MONGO_URI`. We configured the `dotenv` package in `server.js` (`require("dotenv").config();`) and modified the connection parameter to `process.env.MONGO_URI`.
* **Why**: Hardcoding credentials exposes sensitive passwords and database clusters in git repositories, making them vulnerable to hacking, unauthorized access, and database wiping. Using environment variables isolates credentials from code files.

---

### Q15: Explain the purpose of Socket.io in your backend, and how it broadcasts product updates.
**Answer:** Socket.io is initialized using the Node.js `http` server. It listens for client connections and establishes TCP tunnels. In Express routes (like adding a product, updating a test, or submitting an order), we retrieve the socket instance (`req.app.get("io")`) and emit custom events:
```javascript
io.emit("new-order", order);
io.emit("order-updated", order);
```
All connected frontends listening to these events handle them immediately by updating their UI states.

---

### Q16: How does your Express server handle port conflicts? Explain the resilient port binding logic.
**Answer:** We wrote a custom recursive function `startServer` that catches port-in-use errors. If a port (e.g., `5000`) is already bound by another process:
1. The server catches the `EADDRINUSE` error code in the listener block.
2. If the retry threshold is not exceeded, it increments the port number (`port + 1`) and closes the current stale server handle.
3. It calls `startServer(nextPort)` recursively after a 200ms delay.
This ensures the backend server binds successfully and continues running even if port 5000 is occupied.

---

### Q17: What database schemas/models did you create in Mongoose, and how are orders structured?
**Answer:** We created:
* `Product`: Model for medicines and OTC products (title, price, image, discount, category).
* `LabTest`: Model for lab diagnostic packages (name, price, health concern, image).
* `User`: Model for user login credentials.
* `Order`: A comprehensive model representing checkouts. It contains customer info (name, phone, address), an array of `orderItemSchema` sub-documents, `totalAmount`, `orderType` (product, lab-test, or doctor-consultation), `status` (Pending, Accepted, Shipped, etc.), and patient demographics (age, gender, specialty).

---

### Q18: Explain why MongoDB was a good fit for this project instead of a SQL database.
**Answer:** MongoDB is a document-oriented NoSQL database which is highly suitable for this project due to:
* **Flexible Schemas**: Our orders have diverse structures: a medicine order has sub-items with quantities; a lab test order needs patient age and gender; a doctor appointment needs doctor specialty. MongoDB's polymorphic document structures handle this variety cleanly without complex SQL joins.
* **Nested Sub-documents**: We can store order items directly inside the order document using sub-document arrays, which matches JSON data structures on the frontend.
* **JavaScript Integration**: Storing documents in BSON (JSON-like format) makes reading/writing data seamless in JavaScript stacks.

---

### Q19: How does image upload work in your backend, and how are files exposed to the frontend?
**Answer:** 
1. We use **Multer**, a Node.js middleware for handling `multipart/form-data` uploads.
2. The upload route receives the file buffer, saves it to a local folder `/uploads` on the disk, and returns the path (e.g. `/uploads/image.jpg`).
3. We configure Express static middleware: `app.use("/uploads", express.static(path.join(__dirname, "uploads")))` to expose this directory.
4. The frontend appends the backend URL to this relative path to request and display the image.

---

### Q20: What are global error handlers in Node.js, and why did you add `unhandledRejection` and `uncaughtException` listeners?
**Answer:** Global error handlers catch errors that were not handled within individual route blocks:
* `uncaughtException`: Triggered when an error is thrown in synchronous code and is not caught by `try-catch`.
* `unhandledRejection`: Triggered when a Promise is rejected and lacks a `.catch()` block.
Adding these handlers prevents the Node.js process from crashing silently, logs the exact error details, and allows the server to exit gracefully or clean up resources before restarting.

---

## Category 4: Interview Scenarios / Problem Solving

### Q21: What was a critical deployment issue you faced, and how did you resolve it?
**Answer:** During Vercel deployment of the frontend, we faced a block stating *"Vulnerable version of Next.js detected, please update immediately."*
* **The Root Cause**: The project was using React and React-DOM version `19.1.0`. These versions contained a critical unauthenticated Remote Code Execution (RCE) vulnerability (**CVE-2025-55182**) involving React Server Components payload deserialization.
* **The Resolution**: We upgraded `react` and `react-dom` in `package.json` to the secure patched version `19.1.2`, executed `npm install` inside the frontend folder to regenerate the lockfile (`package-lock.json`), and successfully pushed the secure commit to GitHub to trigger Vercel to redeploy successfully.

---

### Q22: What is CVE-2025-55182, and why did Vercel block your deployment because of it?
**Answer:** **CVE-2025-55182** is a critical (CVSS score 10.0) vulnerability in React Server Components. It allows remote, unauthenticated attackers to execute arbitrary code on a server by sending a specially crafted HTTP POST request to exploit insecure deserialization in the React Server "Flight" protocol. Because this is a high-risk security flaw, Vercel and similar hosting platforms automatically block deployments containing vulnerable versions to protect your applications.

---

### Q23: What is the difference between client-side state and server-side state, and how did you sync them?
**Answer:** 
* **Client-Side State**: Temporary data stored in browser memory (such as current cart items, selected category, or local search query input). It is fast but vanishes on page reloads.
* **Server-Side State**: Persistent data stored in the MongoDB database (products, user profiles, orders).
* **Syncing**: We used REST APIs to request server-side state on mount, React Context to update and distribute client-side changes, and `localStorage` to save temporary client-side data locally between page refreshes.

---

### Q24: How did you test your application's build locally before deploying it to Vercel/Render?
**Answer:** We ran:
1. `npm run build` in the `frontend` folder: This executes Next.js production compiler, compiles CSS via PostCSS, runs TypeScript compiler type checking, and flags any syntax/type conflicts (such as deprecated options like `swcMinify`).
2. Tested the backend locally by starting the node server using the `.env` configuration file to ensure database connection and APIs functioned.

---

### Q25: If you had 3 more weeks to work on this project, what features would you add next?
**Answer:** I would prioritize:
1. **User Profile Settings**: Allow users to edit their address and contact numbers.
2. **Order Cancellation & Returns**: Allow users to cancel pending orders or request return pickups.
3. **Prescription Parsing System**: Integrate a document parsing API to scan uploaded prescriptions and suggest matching medicines automatically.
4. **Admin Reports**: Add visual charts to the Admin panel showing sales trends, popular medicines, and active consultations.
5. **Database Indexing**: Add compound index matching on frequently searched fields in the Product collection to optimize search times.

---

## Category 5: Core JavaScript Questions

### Q26: What is the difference between `var`, `let`, and `const` in JavaScript?
**Answer:**
* **`var`**: Function-scoped, can be re-declared and updated, and is hoisted to the top of its scope initialized as `undefined`.
* **`let`**: Block-scoped (bounded by `{}`), can be updated but **cannot** be re-declared in the same scope, and is not initialized during hoisting (Temporal Dead Zone).
* **`const`**: Block-scoped, **cannot** be updated or re-declared. It must be initialized at the time of declaration. Note that for objects/arrays declared with `const`, their properties/elements can still be modified.

---

### Q27: Explain Closures in JavaScript with a simple example.
**Answer:** A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In simple terms, a closure gives an inner function access to the outer function's scope even after the outer function has returned.
**Example:**
```javascript
function outerFunction(outerVariable) {
  return function innerFunction(innerVariable) {
    console.log("Outer: " + outerVariable + ", Inner: " + innerVariable);
  };
}
const newFunction = outerFunction("outside");
newFunction("inside"); // Outputs: Outer: outside, Inner: inside
```

---

### Q28: What is the difference between `==` and `===` operators?
**Answer:**
* **`==` (Loose Equality)**: Compares two values for equality after performing **type coercion** (converting both values to a common type first). For example, `5 == "5"` returns `true`.
* **`===` (Strict Equality)**: Compares both the **value** and the **data type** without coercion. If the types are different, it immediately returns `false`. For example, `5 === "5"` returns `false`.

---

### Q29: What are Promises, and what is the difference between Promises and `async/await`?
**Answer:**
* **Promise**: An object representing the eventual completion (resolve) or failure (reject) of an asynchronous operation. It uses `.then()` and `.catch()` blocks to handle results.
* **`async/await`**: A syntactic sugar built on top of Promises to write asynchronous code that looks and behaves like synchronous code. `async` functions return a Promise, and `await` pauses execution until the Promise resolves or rejects (handled using `try-catch` blocks).

---

### Q30: What is the difference between `map()`, `filter()`, and `forEach()` array methods?
**Answer:**
* **`forEach()`**: Iterates over array elements and executes a callback function for each. It **does not return** a new array (returns `undefined`).
* **`map()`**: Iterates over elements, transforms each element using a callback function, and **returns a new array** of the same length.
* **`filter()`**: Iterates over elements, checks a boolean condition in the callback, and **returns a new array** containing only elements that passed the condition (may be shorter than original).

---

### Q31: What is hoisting in JavaScript?
**Answer:** Hoisting is JavaScript's default behavior of moving variable and function declarations to the top of their containing scope before code execution. 
* Functions declared with the `function` keyword are fully hoisted, meaning they can be called before they are written.
* Variables declared with `var` are hoisted but initialized to `undefined`.
* Variables declared with `let` and `const` are hoisted but remain uninitialized in the "Temporal Dead Zone" (TDZ) and will throw a ReferenceError if accessed before declaration.

---

### Q32: Explain Destructuring and the Spread/Rest operator (`...`).
**Answer:**
* **Destructuring**: A shorthand syntax to extract values from arrays or properties from objects into distinct variables.
  * *Example*: `const { username, role } = user;`
* **Spread Operator (`...`)**: Expands an array or object into individual elements. Used to clone or merge arrays/objects.
  * *Example*: `const newCart = [...prevCart, newItem];`
* **Rest Operator (`...`)**: Condenses multiple elements/arguments into a single array. Used in function parameter lists.
  * *Example*: `const [first, ...remaining] = items;`

---

### Q33: Explain the Event Loop in JavaScript.
**Answer:** JavaScript is single-threaded, meaning it executes one statement at a time. The **Event Loop** is the mechanism that allows JS to perform non-blocking asynchronous operations:
1. **Call Stack**: Executes synchronous code.
2. **Web APIs**: Handles async tasks (timeouts, fetch APIs, DOM events).
3. **Callback/Task Queue**: Holds resolved callbacks.
4. **Event Loop**: Continuously checks if the Call Stack is empty. If it is, it pushes the first callback from the Callback Queue onto the Call Stack to run.

---

### Q34: What is the difference between `null` and `undefined` in JavaScript?
**Answer:**
* **`undefined`**: Means a variable has been declared but has not yet been assigned a value. It is JavaScript's default value for uninitialized variables.
  * *Example*: `let x; console.log(x); // undefined`
  * *Type*: `typeof undefined` is `"undefined"`.
* **`null`**: An assignment value that represents the intentional absence of any object value. It must be explicitly assigned to a variable.
  * *Example*: `let y = null;`
  * *Type*: `typeof null` is `"object"` (a historical bug in JS).

---

### Q35: What is the `this` keyword in JavaScript, and how does it behave in regular functions vs. arrow functions?
**Answer:** The `this` keyword refers to the object that is executing the current piece of code. Its value depends on how the function is called:
1. **Regular Functions**: The value of `this` is dynamically bound depending on the calling context. In a method, it refers to the owner object. In a standalone function, it refers to the global object (or `undefined` in strict mode).
2. **Arrow Functions**: Arrow functions do not have their own `this` binding. They inherit `this` **lexically** from the enclosing parent scope at the time they are defined. `call()`, `apply()`, or `bind()` cannot change the `this` of an arrow function.

---

### Q36: What is the difference between `call()`, `apply()`, and `bind()` methods?
**Answer:** All three methods are used to control the value of the `this` keyword inside a function:
* **`call()`**: Invokes a function immediately, passing the `this` value as the first argument, followed by arguments passed **individually** (separated by commas).
  * *Example*: `greet.call(personObj, "Hello", "World");`
* **`apply()`**: Invokes a function immediately, passing the `this` value as the first argument, followed by arguments passed as an **array**.
  * *Example*: `greet.apply(personObj, ["Hello", "World"]);`
* **`bind()`**: Does not invoke the function immediately. Instead, it **returns a new function** with the `this` context bound permanently to the specified object. It can be invoked later.
  * *Example*: `const boundGreet = greet.bind(personObj); boundGreet("Hello", "World");`

---

### Q37: What is "Callback Hell", and how do Promises and `async/await` solve it?
**Answer:**
* **Callback Hell**: A situation where multiple nested callbacks are passed as arguments to handle sequential asynchronous tasks. It results in pyramid-like, unreadable, and hard-to-maintain code.
* **Solution**:
  * **Promises** replace nesting with **flat chaining** using `.then()` blocks.
  * **`async/await`** simplifies this further by allowing async code to be written sequentially without chains or callbacks:
```javascript
// Callback Hell
getUser(userId, (user) => {
  getOrders(user.id, (orders) => {
    getOrderDetails(orders[0].id, (details) => {
      console.log(details);
    });
  });
});

// Async/Await solution
try {
  const user = await getUser(userId);
  const orders = await getOrders(user.id);
  const details = await getOrderDetails(orders[0].id);
  console.log(details);
} catch (error) {
  console.error(error);
}
```

---

### Q38: Explain Event Bubbling and Event Capturing in JavaScript.
**Answer:** They are the two phases of event propagation in the HTML DOM tree when an event occurs on an element nested inside other elements:
1. **Event Capturing (Trickling)**: The event starts from the window and trickles down through parent elements to the target element. (Rarely used by default).
2. **Event Bubbling**: The event starts from the target element that triggered it and bubbles up to its parent, grandparents, and finally the window. (This is the default browser behavior).
* **Prevention**: You can stop the propagation of an event up or down the DOM tree by calling `event.stopPropagation()` inside the event handler.

---

### Q39: What is the difference between `localStorage`, `sessionStorage`, and `cookies`?
**Answer:**
| Feature | `localStorage` | `sessionStorage` | `cookies` |
| :--- | :--- | :--- | :--- |
| **Capacity** | ~5MB - 10MB | ~5MB | ~4KB |
| **Expiration** | Never (must be cleared manually or via code) | On tab/browser close | Set manually (has an expiry date) |
| **Server Access**| Client-side only (not sent with HTTP requests) | Client-side only (not sent with HTTP requests) | Sent automatically with every HTTP request |
| **Use Case** | Persistent items like Shopping Cart, User preferences | Temporary state like multi-step forms in one session | Authentication tokens (using secure `HttpOnly` cookie) |

---

### Q40: What is the difference between shallow copy and deep copy, and how do you achieve them in JavaScript?
**Answer:**
* **Shallow Copy**: Copies the top-level properties of an object or array. Nested objects or arrays are copied as **references** (they still point to the same memory location).
  * *Methods*: Spread operator `const copy = {...obj}` or `Object.assign({}, obj)`.
  * *Risk*: If you modify `copy.nestedObj.prop`, it will also modify `originalObj.nestedObj.prop`.
* **Deep Copy**: Copies all levels of an object or array, creating completely independent copies of nested elements.
  * *Methods*: 
    1. Using `JSON.parse(JSON.stringify(obj))` (fails for functions, undefined values, Map/Set, RegExp, Dates).
    2. Using `structuredClone(obj)` (the modern native web API for deep copying).
    3. Custom recursive cloning or utilities like Lodash's `_.cloneDeep()`.

---

## Category 6: Core React.js & Next.js Questions

### Q41: What is the Virtual DOM, and how does React use it to optimize rendering?
**Answer:** The Virtual DOM is a lightweight, in-memory representation of the real DOM. When a component's state or props change:
1. React creates a new Virtual DOM tree.
2. It compares the new tree with the previous Virtual DOM tree using a "diffing" algorithm (**Reconciliation**).
3. React calculates the minimum number of changes required and updates **only** those specific parts in the real DOM (called **batching** or **patching**), which is much faster than re-rendering the entire real DOM.

---

### Q42: What is the difference between State and Props in React?
**Answer:**
* **State**: A local, mutable data structure managed *within* the component itself. Changes in state trigger a component re-render.
* **Props (Properties)**: Immutable read-only data passed from a *parent* component to a child component. A child cannot modify the props it receives.

---

### Q43: Why do we use the `key` prop in React lists, and what happens if we use array indexes as keys?
**Answer:**
* **Why**: The `key` prop helps React identify which items have changed, been added, or been removed. It is crucial for Virtual DOM reconciliation to update lists efficiently.
* **Array Indexes**: Using array indexes as keys is discouraged if the list can be reordered, filtered, or deleted. It can cause rendering bugs, incorrect component states, and drop in performance because React assumes the elements at that index are the same. It is best to use a unique ID (like `_id` from MongoDB).

---

### Q44: What are Hooks? Explain the purpose of `useState` and `useEffect`.
**Answer:** Hooks are special functions introduced in React 16.8 that allow functional components to use state and other React lifecycle features without writing class components.
* **`useState`**: Declares a local state variable and a setter function to modify it.
* **`useEffect`**: Performs side effects in functional components (like API calls, subscribing to sockets, setting event listeners). It runs after rendering.

---

### Q45: What is the difference between `useMemo` and `useCallback`?
**Answer:** Both are optimization hooks used to prevent unnecessary re-computations or child re-renders:
* **`useMemo`**: Memoizes the **result value** of an expensive calculation so it is only re-calculated when dependencies change.
* **`useCallback`**: Memoizes the **function definition instance** itself so it is not re-created on every render, preventing unnecessary re-renders of child components that receive the function as props.

---

### Q46: How does React Context API work, and when should we use it?
**Answer:** The Context API provides a way to share global state (like user auth, theme, shopping cart) across the entire component tree without manually passing props down through multiple intermediate levels (**prop drilling**). It should be used for simple, low-frequency global state updates. For highly frequent or massive states, libraries like Redux or Zustand are preferred.

---

### Q47: What is the difference between Controlled and Uncontrolled Components in React forms?
**Answer:**
* **Controlled Component**: The form input value is controlled by React state. The input has a `value` prop bound to state and an `onChange` handler that updates the state. React is the "single source of truth".
* **Uncontrolled Component**: The input value is handled by the real DOM itself. We use React **refs** (`useRef`) to pull the value from the DOM element when needed (e.g. on form submit). It is closer to traditional HTML.

---

### Q48: Why should you never modify React state directly (e.g., `state = y` or `state.push(item)`)?
**Answer:** React states are immutable. React relies on comparing references of state variables to detect changes and determine when to trigger a re-render. If you mutate a state directly, the object reference remains the same, React does not detect the change, and the user interface will not update to show the new values. Always use the state setter function (e.g. `setCart(...)`) with a new object/array copy.

---

### Q49: What is the difference between React Server Components (RSC) and Client Components in Next.js?
**Answer:**
* **React Server Components (RSC)**: The default component type in Next.js App Router. They are rendered entirely on the server.
  * *Pros*: Zero client-side JavaScript bundle footprint, direct database or API fetching from server code, and better security.
  * *Limitations*: Cannot use React hooks (`useState`, `useEffect`), cannot use browser-only APIs (`window`, `document`, `localStorage`).
* **Client Components**: Triggered by adding the `"use client"` directive at the very top of the file. They are pre-rendered on the server but hydated and run on the client.
  * *Pros*: Can use state, hooks, event listeners, and browser APIs.
  * *Limitations*: Increases client-side JS bundle size.

---

### Q50: What is "Prop Drilling", and what are the different ways to avoid it?
**Answer:** Prop drilling is the process of passing props through multiple levels of nested child components just to reach a deeply nested component that actually needs the data, while intermediate components do not use it.
* **How to avoid**:
  1. **React Context API**: Create a provider at the top level and consume the state directly inside the target component.
  2. **Component Composition**: Pass components as props (`children`) so intermediate wrappers don't need to know about the props.
  3. **Global State Management**: Use state managers like Zustand, Redux, or Recoil to store and retrieve data globally.

---

### Q51: What are Custom Hooks in React? Why and when should you write one?
**Answer:** A Custom Hook is a JavaScript function whose name starts with `"use"` and that can call other hooks (like `useState`, `useEffect`, etc.).
* **Why**: To extract and share stateful logic between different components without duplicating code.
* **When**: When you find the same hook-based logic (e.g., fetching data, listening to resize events, handling form validation, tracking socket subscriptions) repeated across multiple components.
* *Example*: Creating `useFetch(url)` to reuse fetching and loading states.

---

### Q52: What are React Fragments, and why should we use them instead of wrapping everything in a `div`?
**Answer:** React components must return a single root element. If you have adjacent elements, you have to wrap them. A Fragment (`<React.Fragment>` or `<>...</>`) acts as a wrapper.
* **Why use it**: 
  1. It does not add an extra node to the HTML DOM, keeping the DOM tree cleaner and lightweight.
  2. It avoids breaking CSS layouts (such as Flexbox or CSS Grid) that depend on direct parent-child relationships.
  3. It uses slightly less memory.

---

### Q53: How do you optimize the performance of a React or Next.js application?
**Answer:**
1. **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary component re-renders and expensive calculations.
2. **Code Splitting**: Use dynamic imports (`next/dynamic` or `React.lazy`) to load components or heavy libraries only when they are needed.
3. **Image Optimization**: Use the Next.js `Image` component to compress, lazy-load, and serve images in modern formats (like WebP).
4. **Debouncing/Throttling**: Limit the rate of heavy operations like window resize handlers or real-time search typing updates.
5. **Server Components (RSC)**: Keep heavy computation and API calls inside Server Components to avoid shipping JS to the client.

---

### Q54: What are Error Boundaries in React, and how do they work?
**Answer:** Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the whole application.
* **How they work**: They are class components that implement the lifecycle methods `static getDerivedStateFromError()` (to render a fallback UI) and `componentDidCatch()` (to log error details). In Next.js, this is simplified using specialized `error.js`/`error.tsx` files placed in route folders.

---

### Q55: What is the difference between a class component and a functional component in React?
**Answer:**
* **Functional Components**: Simple JavaScript functions that accept props and return JSX. Before React 16.8, they were stateless. Now, with Hooks, they support state, lifecycle effects, and memoization. They are the modern standard in React development.
* **Class Components**: ES6 classes extending `React.Component`. They require a `render()` method, use `this.state` and `this.setState()`, and rely on lifecycle methods like `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`. They are considered legacy but are still supported and required for standard Error Boundaries.

---

