/* =========================================================================
   EduSphere · store.js
   Core data engine — localStorage schema, seed data, auth + guard helpers.
   Every page includes this file FIRST, before its own page script.
   ========================================================================= */

const DB_KEYS = {
  USERS: "edusphere_users",
  COURSES: "edusphere_courses",
  COUPONS: "edusphere_coupons",
  SESSION: "edusphere_session"
};

/* -------------------------------------------------------------------------
   Tiny non-cryptographic string hash. This is NOT secure — it exists only
   so plaintext passwords are never sitting directly in localStorage for a
   classroom prototype. Do not reuse for anything real.
   ------------------------------------------------------------------------- */
function hashPassword(raw) {
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(36) + "_" + raw.length;
}

function generateId(prefix) {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 9999);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------
   Seed data — only written the first time the app ever runs on a browser.
   ------------------------------------------------------------------------- */
function seedCourses() {
  return [
    {
      id: "c_orbit",
      title: "Orbital Mechanics of the DOM",
      category: "Frontend",
      price: 1499,
      thumbnail: "🛰️",
      description: "Understand how the browser builds, walks, and mutates the document tree.",
      syllabus: [
        {
          moduleTitle: "Module 1 · Reading the Tree",
          lessons: [
            { id: "l_orbit_1", title: "Nodes, Elements & the Document", duration: 6,
              content: "Every tag in your HTML becomes a node inside a tree the browser keeps in memory. Elements are one kind of node; text and comments are others. document is the root object you use to reach any of them." },
            { id: "l_orbit_2", title: "Selecting Elements", duration: 5,
              content: "getElementById, getElementsByClassName and querySelector/querySelectorAll are the four doors into the tree. querySelector accepts full CSS selector syntax, which makes it the most flexible of the four." }
          ]
        },
        {
          moduleTitle: "Module 2 · Changing the Tree",
          lessons: [
            { id: "l_orbit_3", title: "Creating & Removing Nodes", duration: 7,
              content: "createElement builds a node that exists only in memory until you attach it with appendChild or insertBefore. removeChild detaches a node permanently unless you keep a reference to it." },
            { id: "l_orbit_4", title: "classList in Practice", duration: 5,
              content: "classList.add, remove and toggle are the safe way to change an element's visual state without hand-editing className strings and risking duplicate classes." }
          ]
        }
      ],
      reviews: [
        { user: "priya_dev", text: "Finally understood the difference between nodes and elements.", rating: 5 },
        { user: "arjun_codes", text: "The tree-walking exercises were tough but worth it.", rating: 4 }
      ]
    },
    {
      id: "c_async",
      title: "Asynchronous Signals",
      category: "JavaScript",
      price: 1799,
      thumbnail: "⏱️",
      description: "Callbacks, promises and async/await — how JavaScript handles things that take time.",
      syllabus: [
        {
          moduleTitle: "Module 1 · Waiting Without Blocking",
          lessons: [
            { id: "l_async_1", title: "The Callback Pattern", duration: 6,
              content: "A callback is just a function passed into another function to be run later. setTimeout is the simplest possible example: it takes a callback and a delay in milliseconds." },
            { id: "l_async_2", title: "Callback Hell & Why Promises Exist", duration: 6,
              content: "Nesting callback inside callback inside callback quickly becomes unreadable. A Promise gives that nested chain a flat, linear shape with .then()." }
          ]
        },
        {
          moduleTitle: "Module 2 · Promises in Practice",
          lessons: [
            { id: "l_async_3", title: "Pending, Resolved, Rejected", duration: 5,
              content: "Every promise starts pending and settles exactly once, either to resolved or rejected. Once settled, its outcome never changes again." },
            { id: "l_async_4", title: "async/await Syntax", duration: 6,
              content: "async/await is sugar on top of promises: await pauses a function's execution until the awaited promise settles, without blocking the rest of the page." }
          ]
        }
      ],
      reviews: [
        { user: "meera_k", text: "The setTimeout diagrams made the event loop click for me.", rating: 5 }
      ]
    },
    {
      id: "c_layout",
      title: "Grid, Flex & The Cascade",
      category: "CSS",
      price: 1299,
      thumbnail: "🧩",
      description: "Layout systems, specificity, and building interfaces that hold together.",
      syllabus: [
        {
          moduleTitle: "Module 1 · Why Styles Win",
          lessons: [
            { id: "l_layout_1", title: "Specificity & the Cascade", duration: 6,
              content: "When two rules target the same element, the browser resolves the conflict using specificity first, then source order. An id always outweighs any number of classes." },
            { id: "l_layout_2", title: "The Box Model", duration: 5,
              content: "Content, padding, border and margin stack outward from every element. box-sizing: border-box changes what the declared width actually measures." }
          ]
        },
        {
          moduleTitle: "Module 2 · Two-Dimensional Layout",
          lessons: [
            { id: "l_layout_3", title: "Flexbox Axis Control", duration: 6,
              content: "Flexbox lays items along a single main axis at a time. justify-content controls that main axis while align-items controls the cross axis." },
            { id: "l_layout_4", title: "Grid Template Areas", duration: 7,
              content: "CSS Grid lets you name regions of a layout directly in the stylesheet and place children into those named regions, which keeps complex layouts readable." }
          ]
        }
      ],
      reviews: [
        { user: "rahul_ui", text: "Grid template areas finally made sense after this course.", rating: 5 },
        { user: "sana_f", text: "Wish there were more practice drills on specificity.", rating: 3 }
      ]
    },
    {
      id: "c_state",
      title: "State, Storage & Structured Data",
      category: "JavaScript",
      price: 1599,
      thumbnail: "🗃️",
      description: "Objects, arrays and localStorage — how real applications remember things.",
      syllabus: [
        {
          moduleTitle: "Module 1 · Modeling Data",
          lessons: [
            { id: "l_state_1", title: "Objects as Real-World Models", duration: 5,
              content: "An object bundles related data under one name using key-value pairs, which mirrors how we describe real things: a user has a name, an email and a role." },
            { id: "l_state_2", title: "Array Methods That Transform Data", duration: 7,
              content: "map returns a new array of the same length with each item transformed. filter returns a shorter array containing only items that pass a test. reduce folds an entire array down into one value." }
          ]
        },
        {
          moduleTitle: "Module 2 · Making Data Persist",
          lessons: [
            { id: "l_state_3", title: "localStorage Basics", duration: 5,
              content: "localStorage only stores strings, so objects and arrays must be run through JSON.stringify before saving and JSON.parse after reading them back." },
            { id: "l_state_4", title: "Designing a Storage Schema", duration: 6,
              content: "Before writing any UI code, decide what keys you need and what shape each one holds. A clear schema up front prevents scattered, inconsistent reads and writes later." }
          ]
        }
      ],
      reviews: [
        { user: "dev_anya", text: "The schema-first advice saved me from a huge refactor.", rating: 5 }
      ]
    }
  ];
}

function seedQuizzes() {
  return {
    l_orbit_1: { questions: [
      { type: "single", question: "What is the root object used to reach the document tree?", options: ["window", "document", "root", "DOM"], correct: [1] },
      { type: "single", question: "Which of these is NOT a node type?", options: ["Element", "Text", "Comment", "Selector"], correct: [3] },
      { type: "multi", question: "Which are examples of DOM nodes? (select all)", options: ["An <li> element", "A text string inside a <p>", "An HTML comment", "A CSS class name"], correct: [0, 1, 2] }
    ]},
    l_orbit_2: { questions: [
      { type: "single", question: "Which method accepts full CSS selector syntax and returns the first match?", options: ["getElementById", "querySelector", "getElementsByClassName", "getElementsByTagName"], correct: [1] },
      { type: "single", question: "getElementById expects which kind of argument?", options: ["A CSS class", "A tag name", "An id (no #)", "A selector string"], correct: [2] },
      { type: "multi", question: "Which return a live or static list of multiple elements? (select all)", options: ["getElementsByClassName", "querySelectorAll", "getElementById", "getElementsByTagName"], correct: [0, 1, 3] }
    ]},
    l_orbit_3: { questions: [
      { type: "single", question: "Which method builds a brand-new element in memory?", options: ["appendChild", "createElement", "insertBefore", "removeChild"], correct: [1] },
      { type: "single", question: "A created element becomes visible on the page after you...", options: ["console.log it", "attach it with appendChild/insertBefore", "set its id", "nothing extra needed"], correct: [1] },
      { type: "multi", question: "Which of these mutate the tree structure? (select all)", options: ["appendChild", "removeChild", "insertBefore", "getAttribute"], correct: [0, 1, 2] }
    ]},
    l_orbit_4: { questions: [
      { type: "single", question: "Which classList method flips a class on and off?", options: ["add", "remove", "toggle", "replace"], correct: [2] },
      { type: "single", question: "Why prefer classList over editing className directly?", options: ["It's shorter to type", "It avoids duplicate/broken class strings", "It changes CSS files", "No real reason"], correct: [1] },
      { type: "multi", question: "Which are valid classList methods? (select all)", options: ["add", "remove", "toggle", "delete"], correct: [0, 1, 2] }
    ]},
    l_async_1: { questions: [
      { type: "single", question: "A callback is...", options: ["A loop", "A function passed to run later", "A CSS rule", "An HTML tag"], correct: [1] },
      { type: "single", question: "setTimeout's second argument is measured in...", options: ["seconds", "milliseconds", "minutes", "frames"], correct: [1] },
      { type: "multi", question: "Which use callbacks? (select all)", options: ["setTimeout", "addEventListener", "Array.map", "CSS Grid"], correct: [0, 1, 2] }
    ]},
    l_async_2: { questions: [
      { type: "single", question: "\"Callback hell\" refers to...", options: ["Too many CSS files", "Deeply nested callbacks", "A browser crash", "A missing semicolon"], correct: [1] },
      { type: "single", question: "Promises help by...", options: ["Removing async code entirely", "Flattening nested chains with .then()", "Replacing HTML", "Speeding up the CPU"], correct: [1] },
      { type: "multi", question: "Which are true of promise chains? (select all)", options: [".then() can be chained", "They read more linearly than nested callbacks", "They must always fail", "They replace variables"], correct: [0, 1] }
    ]},
    l_async_3: { questions: [
      { type: "single", question: "A promise's initial state is always...", options: ["resolved", "rejected", "pending", "settled"], correct: [2] },
      { type: "single", question: "How many times can a promise settle?", options: ["Zero", "Exactly once", "Twice", "Unlimited"], correct: [1] },
      { type: "multi", question: "Which are valid promise states? (select all)", options: ["pending", "resolved", "rejected", "looping"], correct: [0, 1, 2] }
    ]},
    l_async_4: { questions: [
      { type: "single", question: "await can only be used inside a function marked...", options: ["static", "async", "const", "strict"], correct: [1] },
      { type: "single", question: "await pauses execution of...", options: ["the whole browser", "just that function", "all functions", "the CSS engine"], correct: [1] },
      { type: "multi", question: "Which are true about async/await? (select all)", options: ["Built on top of promises", "Makes async code read top-to-bottom", "Blocks the entire page", "Removes the need for try/catch entirely"], correct: [0, 1] }
    ]},
    l_layout_1: { questions: [
      { type: "single", question: "Which wins when specificity is equal?", options: ["Alphabetical order", "Source order (later wins)", "Shorter selector", "Random"], correct: [1] },
      { type: "single", question: "An id selector vs a class selector — which is more specific?", options: ["class", "id", "equal", "depends on browser"], correct: [1] },
      { type: "multi", question: "Which raise specificity? (select all)", options: ["#id", ".class", "element", "!important overrides cascade order too"], correct: [0, 1, 2] }
    ]},
    l_layout_2: { questions: [
      { type: "single", question: "Order of the box model from inside out is...", options: ["margin, border, padding, content", "content, padding, border, margin", "padding, content, margin, border", "border, content, padding, margin"], correct: [1] },
      { type: "single", question: "box-sizing: border-box makes width include...", options: ["only content", "content + padding + border", "only margin", "nothing changes"], correct: [1] },
      { type: "multi", question: "Which are part of the box model? (select all)", options: ["content", "padding", "border", "z-index"], correct: [0, 1, 2] }
    ]},
    l_layout_3: { questions: [
      { type: "single", question: "justify-content controls the...", options: ["cross axis", "main axis", "font size", "z-index"], correct: [1] },
      { type: "single", question: "align-items controls the...", options: ["main axis", "cross axis", "grid rows only", "nothing in flex"], correct: [1] },
      { type: "multi", question: "Which are valid flex properties? (select all)", options: ["justify-content", "align-items", "flex-direction", "grid-template-areas"], correct: [0, 1, 2] }
    ]},
    l_layout_4: { questions: [
      { type: "single", question: "grid-template-areas lets you name...", options: ["colors", "regions of a layout", "fonts", "HTTP requests"], correct: [1] },
      { type: "single", question: "CSS Grid is best described as a...", options: ["1D layout system", "2D layout system", "animation library", "color system"], correct: [1] },
      { type: "multi", question: "Which are Grid-related properties? (select all)", options: ["grid-template-columns", "grid-template-areas", "justify-content", "text-decoration"], correct: [0, 1, 2] }
    ]},
    l_state_1: { questions: [
      { type: "single", question: "An object stores data as...", options: ["ordered list only", "key-value pairs", "raw text only", "binary only"], correct: [1] },
      { type: "single", question: "Which notation accesses a property whose name is stored in a variable?", options: ["Dot notation", "Bracket notation", "Both work identically", "Neither"], correct: [1] },
      { type: "multi", question: "Which are valid ways to model a user? (select all)", options: ["{ name: 'Ana', role: 'student' }", "An array of unrelated numbers", "A nested object with an address field", "A single boolean"], correct: [0, 2] }
    ]},
    l_state_2: { questions: [
      { type: "single", question: "Which array method returns a NEW array of the SAME length?", options: ["filter", "map", "reduce", "find"], correct: [1] },
      { type: "single", question: "Which array method folds everything into a single value?", options: ["map", "filter", "reduce", "forEach"], correct: [2] },
      { type: "multi", question: "Which return a new array without mutating the original? (select all)", options: ["map", "filter", "sort (in some engines mutates!)", "reduce (returns any value, not necessarily array)"], correct: [0, 1] }
    ]},
    l_state_3: { questions: [
      { type: "single", question: "localStorage can natively store...", options: ["Any JS object directly", "Only strings", "Only numbers", "Only arrays"], correct: [1] },
      { type: "single", question: "Which converts an object into a storable string?", options: ["JSON.parse", "JSON.stringify", "String.split", "Object.freeze"], correct: [1] },
      { type: "multi", question: "Which are true about localStorage? (select all)", options: ["Persists after the tab closes", "Needs JSON.stringify to store objects", "Automatically stores live objects", "Needs JSON.parse to read objects back"], correct: [0, 1, 3] }
    ]},
    l_state_4: { questions: [
      { type: "single", question: "Designing a schema before coding UI mainly prevents...", options: ["Slow CSS", "Inconsistent, scattered reads/writes later", "Slow internet", "Browser crashes"], correct: [1] },
      { type: "single", question: "A good storage key name should be...", options: ["Random", "Descriptive of what it holds", "As short as possible always", "Numeric only"], correct: [1] },
      { type: "multi", question: "Which are good schema-design habits? (select all)", options: ["Deciding keys before writing UI code", "Keeping related data grouped consistently", "Storing the same fact in five different keys", "Documenting the shape of each key"], correct: [0, 1, 3] }
    ]}
  };
}

function seedCoupons() {
  return [
    { code: "EDU30", discountPercent: 30, active: true },
    { code: "HALFPRICE", discountPercent: 50, active: true },
    { code: "WELCOME10", discountPercent: 10, active: true }
  ];
}

function initDatabase() {
  if (!localStorage.getItem(DB_KEYS.COURSES)) {
    const courses = seedCourses();
    const quizzes = seedQuizzes();
    courses.forEach(c => { c.quizzes = quizzes; });
    localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(courses));
  }
  if (!localStorage.getItem(DB_KEYS.COUPONS)) {
    localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify(seedCoupons()));
  }
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify([
      {
        id: "u_admin",
        username: "admin",
        email: "admin@edusphere.io",
        passwordHash: hashPassword("Admin@123"),
        role: "admin",
        purchasedCourses: [],
        progress: {},
        wallet: 0,
        streak: { lastLogin: "", count: 0 },
        avatarBase64: "",
        theme: "aurora",
        joinedDate: todayStamp()
      }
    ]));
  }
}
initDatabase();

/* -------------------------------------------------------------------------
   Generic read / write helpers
   ------------------------------------------------------------------------- */
const DB = {
  getUsers: () => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || "[]"),
  saveUsers: (arr) => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(arr)),
  getCourses: () => JSON.parse(localStorage.getItem(DB_KEYS.COURSES) || "[]"),
  saveCourses: (arr) => localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(arr)),
  getCoupons: () => JSON.parse(localStorage.getItem(DB_KEYS.COUPONS) || "[]"),
  saveCoupons: (arr) => localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify(arr)),
  getSession: () => JSON.parse(localStorage.getItem(DB_KEYS.SESSION) || "null"),
  setSession: (obj) => localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(obj)),
  clearSession: () => localStorage.removeItem(DB_KEYS.SESSION)
};

function getCurrentUser() {
  const session = DB.getSession();
  if (!session) return null;
  return DB.getUsers().find(u => u.id === session.userId) || null;
}

function persistUser(updatedUser) {
  const users = DB.getUsers().map(u => (u.id === updatedUser.id ? updatedUser : u));
  DB.saveUsers(users);
}

function courseAverageRating(course) {
  if (!course.reviews || course.reviews.length === 0) return 0;
  const total = course.reviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / course.reviews.length) * 10) / 10;
}

function courseProgressPercent(user, courseId) {
  const course = DB.getCourses().find(c => c.id === courseId);
  if (!course) return 0;
  const allLessons = course.syllabus.flatMap(m => m.lessons);
  if (allLessons.length === 0) return 0;
  const userCourseProgress = (user.progress && user.progress[courseId]) || {};
  const completedCount = allLessons.filter(l => userCourseProgress[l.id] && userCourseProgress[l.id].completed).length;
  return Math.round((completedCount / allLessons.length) * 100);
}

/* -------------------------------------------------------------------------
   Route guards — every protected page calls guardRequireAuth() at the very
   top of its own script, before touching the DOM. Auth-only pages (login,
   register) call guardRedirectIfLoggedIn().
   ------------------------------------------------------------------------- */
function guardRequireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.replace("login.html");
  }
  return user;
}

function guardRequireAdmin() {
  const user = guardRequireAuth();
  if (user && user.role !== "admin") {
    window.location.replace("dashboard.html");
  }
  return user;
}

function guardRedirectIfLoggedIn() {
  const user = getCurrentUser();
  if (user) {
    window.location.replace(user.role === "admin" ? "admin.html" : "dashboard.html");
  }
}

function applyStoredTheme() {
  const user = getCurrentUser();
  const theme = (user && user.theme) || localStorage.getItem("edusphere_guest_theme") || "aurora";
  document.documentElement.setAttribute("data-theme", theme);
}
applyStoredTheme();
