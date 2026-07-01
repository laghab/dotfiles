// src/util/queue.ts
var Node = class {
  constructor(value) {
    this.next = null;
    this.value = value;
  }
  append(node) {
    this.next = node;
    return this.next;
  }
};
var Queue = class {
  constructor() {
    this.head = null;
    this.tail = null;
    this.count = 0;
  }
  push(value) {
    if (this.head === null || this.tail === null) {
      this.head = new Node(value);
      this.tail = this.head;
    } else {
      this.tail = this.tail.append(new Node(value));
    }
    this.count += 1;
  }
  multipush(values) {
    for (const value of values) {
      this.push(value);
    }
  }
  pop() {
    if (this.head === null) {
      return void 0;
    }
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head === null) {
      this.tail = null;
    }
    this.count -= 1;
    return value;
  }
  peek() {
    return this.head?.value;
  }
  getAtIndex(index) {
    let node = this.head;
    for (let i = 0; i < index; i += 1) {
      if (node === null) {
        return void 0;
      }
      node = node.next;
    }
    return node?.value;
  }
  removeAtIndex(index) {
    if (index < 0 || index >= this.count) {
      return void 0;
    }
    let node = this.head;
    let prevNode = null;
    for (let i = 0; i < index; i += 1) {
      if (node === null) {
        return void 0;
      }
      prevNode = node;
      node = node.next;
    }
    if (node === null) return void 0;
    if (prevNode !== null) {
      prevNode.next = node.next;
    }
    return node.value;
  }
  get size() {
    return this.count;
  }
  get isEmpty() {
    return this.count === 0;
  }
  *[Symbol.iterator]() {
    let currNode = this.head;
    while (currNode !== null) {
      let ret = currNode.value;
      currNode = currNode.next;
      yield ret;
    }
  }
  some(fn) {
    for (const x of this) {
      if (fn(x)) {
        return true;
      }
    }
    return false;
  }
  indexOf(fn) {
    let node = this.head;
    for (let i = 0; i < this.count; i += 1) {
      if (node === null) {
        return -1;
      }
      if (fn(node.value)) {
        return i;
      }
      node = node.next;
    }
    return -1;
  }
};

// src/controller/event.ts
function eventsAreParallel(ev1, ev2) {
  if (ev1.window !== ev2.window) return false;
  if (ev1.output !== ev2.output) return false;
  if (ev1.activity !== ev2.activity) return false;
  if (ev1.desktop !== ev2.desktop) return false;
  return true;
}
function eventsAreSame(ev1, ev2) {
  if (ev1.t !== ev2.t) return false;
  for (const prop in ev1) {
    const val1 = ev1[prop];
    const val2 = ev2[prop];
    if (val1 !== val2) return false;
  }
  return true;
}
function simplifyEvents(oldEvents) {
  const newEvents = new Queue();
  for (const ev of oldEvents) {
    if (newEvents.some((e) => eventsAreSame(ev, e))) {
      continue;
    }
    if (ev.t == "tileWindow" || ev.t == "untileWindow") {
      const parallelEventIdx = newEvents.indexOf((e) => {
        if (ev.t == "tileWindow" && e.t == "untileWindow") {
          return eventsAreParallel(ev, e);
        } else if (e.t == "tileWindow" && ev.t == "untileWindow") {
          return eventsAreParallel(e, ev);
        } else {
          return false;
        }
      });
      if (parallelEventIdx != -1) {
        newEvents.removeAtIndex(parallelEventIdx);
      }
    }
    if (ev.t == "changeEngine" && ev.engineSettings === void 0 && ev.engineType === void 0) {
      continue;
    }
    newEvents.push(ev);
  }
  return newEvents;
}
function simplifyPostEvents(oldEvents) {
  const newEvents = new Queue();
  for (const ev of oldEvents) {
    if (newEvents.some((e) => eventsAreSame(ev, e))) {
      continue;
    }
    newEvents.push(ev);
  }
  return newEvents;
}
function createTileEvents(window, desktops, activities, output) {
  if (desktops === void 0) desktops = window.desktops;
  if (activities === void 0) activities = window.activities;
  if (output === void 0) output = window.output;
  const ret = [];
  for (const desktop of desktops) {
    for (const activity of activities) {
      ret.push({
        t: "tileWindow",
        window,
        desktop,
        activity,
        output
      });
    }
  }
  return ret;
}
function createUntileEvents(window, desktops, activities, output) {
  if (desktops === void 0) desktops = window.desktops;
  if (activities === void 0) activities = window.activities;
  if (output === void 0) output = window.output;
  const ret = [];
  for (const desktop of desktops) {
    for (const activity of activities) {
      ret.push({
        t: "untileWindow",
        window,
        desktop,
        activity,
        output
      });
    }
  }
  return ret;
}

// src/util/geometry.ts
function translateDirection(d) {
  let ret = 0 /* None */;
  if (!(d & 4 /* Vertical */)) ret |= 4 /* Vertical */;
  if (d & 2 /* Right */) ret |= 1 /* Down */;
  if (d & 1 /* Down */) ret |= 2 /* Right */;
  return ret;
}
var GPoint = class {
  constructor(p) {
    this.x = 0;
    this.y = 0;
    if (p == void 0) {
      return;
    }
    this.x = p.x;
    this.y = p.y;
  }
  toString() {
    return "GPoint(" + this.x + ", " + this.y + ")";
  }
};
var GRect = class {
  constructor(r) {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    if (r == void 0) {
      return;
    }
    this.x = r.x;
    this.y = r.y;
    this.width = r.width;
    this.height = r.height;
  }
  directionFromPoint(p) {
    const relativePoint = new GPoint({
      x: p.x - this.x,
      y: p.y - this.y
    });
    if (relativePoint.x < this.width / 2) {
      if (relativePoint.y < this.height / 2) {
        if (relativePoint.x > this.width * relativePoint.y / this.height) {
          return 4 /* Vertical */;
        } else {
          return 0 /* None */;
        }
      } else {
        if (relativePoint.x > this.width * relativePoint.y / this.height) {
          return 1 /* Down */ | 4 /* Vertical */;
        } else {
          return 1 /* Down */;
        }
      }
    } else {
      if (relativePoint.y < this.height / 2) {
        if (relativePoint.x < this.width * relativePoint.y / this.height) {
          return 2 /* Right */ | 4 /* Vertical */;
        } else {
          return 2 /* Right */;
        }
      } else {
        if (relativePoint.x < this.width * relativePoint.y / this.height) {
          return 1 /* Down */ | 2 /* Right */ | 4 /* Vertical */;
        } else {
          return 1 /* Down */ | 2 /* Right */;
        }
      }
    }
  }
  get center() {
    return new GPoint({
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    });
  }
  contains(rect) {
    if (rect.x < this.x || rect.y < this.y) {
      return false;
    }
    if (rect.x + rect.width > this.x + this.width || rect.y + rect.height > this.y + this.height) {
      return false;
    }
    return true;
  }
  toString() {
    return "GRect(" + this.x + ", " + this.y + +", " + this.width + ", " + this.height + ")";
  }
  writeTo(r) {
    if (r.width != this.width) {
      r.width = this.width;
    }
    if (r.height != this.height) {
      r.height = this.height;
    }
    if (r.x != this.x) {
      r.x = this.x;
    }
    if (r.y != this.y) {
      r.y = this.y;
    }
  }
};

// src/controller/handlers/window.ts
var WindowHandler = class {
  constructor(window, workspace) {
    this.window = window;
    this.workspace = workspace;
    this.previousDesktops = [...window.desktops];
    this.previousActivities = [...window.activities];
    this.previousOutput = window.output;
    this.tiled = this.startTiled();
    this.wantsTiled = this.tiled;
    this.window.desktopsChanged.connect(this.desktopsChanged.bind(this));
    this.window.activitiesChanged.connect(
      this.activitiesChanged.bind(this)
    );
    this.window.outputChanged.connect(this.outputChanged.bind(this));
    this.window.fullScreenChanged.connect(
      this.fullscreenChanged.bind(this)
    );
    this.window.minimizedChanged.connect(this.minimizedChanged.bind(this));
    this.window.interactiveMoveResizeStepped.connect(
      this.interactiveMoveResizeStepped.bind(this)
    );
    this.window.interactiveMoveResizeFinished.connect(
      this.interactiveMoveResizeFinished.bind(this)
    );
  }
  startTiled() {
    if (this.window.specialWindow || !config().tilePopups && (this.window.popupWindow || this.window.transient)) {
      return false;
    }
    if (!this.canBeTiled()) {
      return false;
    }
    if (config().ignoreWindowClasses && config().ignoreWindowClasses.test(this.window.resourceClass)) {
      return false;
    }
    if (config().floatingWindowClasses && config().floatingWindowClasses.test(this.window.resourceClass)) {
      return false;
    }
    return true;
  }
  outputChanged() {
    console().debug("output changed on window", this.window.resourceClass);
    const previousOutput = this.previousOutput;
    this.previousOutput = this.window.output;
    if (!this.tiled) return;
    for (const ev of createUntileEvents(
      this.window,
      this.previousDesktops,
      this.previousActivities,
      previousOutput
    )) {
      controller().queueEvent(ev);
    }
    for (const ev of createTileEvents(this.window)) {
      controller().queueEvent(ev);
    }
  }
  desktopsChanged() {
    console().debug(
      "desktops changed on window",
      this.window.resourceClass
    );
    const previousDesktops = [...this.previousDesktops];
    this.previousDesktops = [...this.window.desktops];
    if (!this.tiled) return;
    for (const ev of createUntileEvents(
      this.window,
      previousDesktops,
      this.previousActivities,
      this.previousOutput
    )) {
      controller().queueEvent(ev);
    }
    for (const ev of createTileEvents(this.window)) {
      controller().queueEvent(ev);
    }
  }
  activitiesChanged() {
    console().debug(
      "activities changed on window",
      this.window.resourceClass
    );
    const previousActivities = [...this.previousActivities];
    this.previousActivities = [...this.window.activities];
    if (!this.tiled) return;
    for (const ev of createUntileEvents(
      this.window,
      this.previousDesktops,
      previousActivities,
      this.previousOutput
    )) {
      controller().queueEvent(ev);
    }
    for (const ev of createTileEvents(this.window)) {
      controller().queueEvent(ev);
    }
  }
  fullscreenChanged() {
    console().debug(
      "fullscreen changed on window",
      this.window.resourceClass
    );
    if (this.window.fullScreen && this.tiled) {
      this.tiled = false;
      for (const ev of createUntileEvents(this.window)) {
        controller().queueEvent(ev);
      }
      controller().queuePostEvent({
        t: "setWindowProperties",
        window: this.window,
        fullscreen: false
      });
      controller().queuePostEvent({
        t: "setWindowProperties",
        window: this.window,
        fullscreen: true
      });
    } else if (this.canBeTiled() && !this.tiled && this.wantsTiled) {
      this.tiled = true;
      for (const ev of createTileEvents(this.window)) {
        controller().queueEvent(ev);
      }
    }
  }
  minimizedChanged() {
    console().debug(
      "minimized changed on window",
      this.window.resourceClass
    );
    if (this.window.minimized && this.tiled) {
      this.tiled = false;
      for (const ev of createUntileEvents(this.window)) {
        controller().queueEvent(ev);
      }
    } else if (this.canBeTiled() && !this.tiled && this.wantsTiled) {
      this.tiled = true;
      for (const ev of createTileEvents(this.window)) {
        controller().queueEvent(ev);
      }
    }
  }
  // use this instead of tileChanged because tileChanged does what it wants
  // use stepped instead of started as there can be some delay setting window.tile to null
  interactiveMoveResizeStepped() {
    if (!(this.tiled && this.canBeTiled() && this.window.tile == null))
      return;
    console().debug(
      "move/resize stepped (first step) on window",
      this.window.resourceClass
    );
    this.tiled = false;
    for (const ev of createUntileEvents(this.window)) {
      controller().queueEvent(ev);
    }
  }
  interactiveMoveResizeFinished() {
    if (!(this.wantsTiled && this.canBeTiled() && !this.tiled)) return;
    console().debug(
      "move/resize finished on window",
      this.window.resourceClass
    );
    const cursorPos = this.workspace.cursorPos;
    this.tiled = true;
    for (const desktop of this.window.desktops) {
      const rootTile = this.workspace.rootTile(
        this.window.output,
        desktop
      );
      const tile = rootTile.tiles.length == 0 ? rootTile : rootTile.pick(cursorPos);
      if (tile == null) {
        controller().queueEvent({
          t: "tileWindow",
          window: this.window,
          desktop,
          activity: this.workspace.currentActivity,
          output: this.window.output
        });
      } else {
        controller().queueEvent({
          t: "placeWindow",
          window: this.window,
          desktop,
          activity: this.workspace.currentActivity,
          output: this.window.output,
          tile,
          direction: new GRect(
            tile.absoluteGeometry
          ).directionFromPoint(cursorPos)
        });
      }
    }
    for (const activity of this.window.activities) {
      if (activity === this.workspace.currentActivity) continue;
      for (const ev of createTileEvents(
        this.window,
        this.window.desktops,
        [activity],
        this.window.output
      )) {
        controller().queueEvent(ev);
      }
    }
  }
  canBeTiled() {
    return !(this.window.fullScreen || this.window.minimized);
  }
};

// src/engine/engine.ts
var Window = class {
  constructor(id, name, minSize) {
    this.id = id;
    this.name = name;
    this.minSize = minSize;
  }
};
var Tile = class _Tile {
  constructor(parent) {
    this.children = [];
    this.layoutDirection = 1 /* Horizontal */;
    // relative size to other children of this tile
    this.size = 1;
    this.windows = [];
    this.parent = parent ?? null;
    if (this.parent == null) {
      return;
    }
    this.parent.children.push(this);
  }
  // adds a child that will split perpendicularly to the parent. Returns the child
  addChild() {
    let splitDirection = 1 /* Horizontal */;
    if (this.layoutDirection == 1 /* Horizontal */) {
      splitDirection = 2 /* Vertical */;
    }
    const childTile = new _Tile(this);
    childTile.layoutDirection = splitDirection;
    return childTile;
  }
  // adds a child that will split parallel to the parent. Not really recommeneded
  addChildParallel() {
    const childTile = new _Tile(this);
    childTile.layoutDirection = this.layoutDirection;
    return childTile;
  }
  // split a tile, aka add two children
  split() {
    this.addChild();
    this.addChild();
  }
  // removes a tile and all its children
  remove() {
    const parent = this.parent;
    if (parent == null) {
      return;
    }
    parent.children.splice(parent.children.indexOf(this), 1);
    this.children = [];
    this.windows = [];
  }
  // remove child tiles
  removeChildren() {
    for (const tile of this.children) {
      tile.remove();
    }
    this.children = [];
  }
  totalChildrenSize() {
    return this.children.reduce((s, t) => s + t.size, 0);
  }
};
var BaseEngineSettings = class {
  getProps() {
    const ret = {};
    for (const key in this) {
      if (typeof this[key] !== "function") {
        ret[key] = this[key];
      }
    }
    return ret;
  }
  setProps(obj) {
    if (obj == null) return;
    for (const key in this) {
      if (obj.hasOwnProperty(key)) this[key] = obj[key];
    }
  }
};

// src/engine/layouts/btree.ts
var BTreeSettings = class extends BaseEngineSettings {
  constructor() {
    super(...arguments);
    this.swapInsertSide = false;
    this.rotateLayout = false;
  }
};
var Node2 = class _Node {
  constructor(parent) {
    this.parent = null;
    this.children = null;
    this.window = null;
    this.size = 1;
    this.destroyed = false;
    this.layoutDirectionRoot = 1 /* Horizontal */;
    if (parent) {
      this.parent = parent;
    }
  }
  get layoutDirection() {
    if (this.parent === null) {
      return this.layoutDirectionRoot;
    }
    if (this.parent.layoutDirection == 1 /* Horizontal */) {
      return 2 /* Vertical */;
    } else {
      return 1 /* Horizontal */;
    }
  }
  split(windowInheritor) {
    if (this.children !== null) {
      return;
    }
    this.children = [new _Node(this), new _Node(this)];
    this.children[windowInheritor].window = this.window;
    this.window = null;
  }
  // don't call this if a window exists in that tile
  // or I guess you could call it but it would untile the window
  destroy() {
    if (this.parent === null || this.parent.children === null) {
      return;
    }
    const sibling = this.parent.children[0] === this ? this.parent.children[1] : this.parent.children[0];
    if (sibling.window !== null) {
      this.parent.window = sibling.window;
    }
    this.parent.children = sibling.children === null ? null : [...sibling.children];
    for (const child of this.parent.children ?? []) {
      child.parent = this.parent;
    }
    this.destroyed = true;
    sibling.destroyed = true;
  }
};
var BTreeEngine = class {
  constructor() {
    this.settings = new BTreeSettings();
    this.root = new Node2();
    this.tileMap = /* @__PURE__ */ new Map();
    this.windowSet = /* @__PURE__ */ new Set();
  }
  getEngineSettings() {
    return this.settings.getProps();
  }
  setEngineSettings(settings) {
    this.settings.setProps(settings);
    this.root.layoutDirectionRoot = this.settings.rotateLayout ? 2 /* Vertical */ : 1 /* Horizontal */;
  }
  buildLayout() {
    const queue = new Queue();
    const rootTile = new Tile();
    this.tileMap.clear();
    queue.push([this.root, rootTile]);
    while (!queue.isEmpty) {
      const [node, tile] = queue.pop();
      this.tileMap.set(tile, node);
      if (node.window !== null) tile.windows.push(node.window);
      tile.size = node.size;
      tile.layoutDirection = node.layoutDirection;
      if (node.children !== null) {
        const [child1, child2] = node.children;
        const tile1 = tile.addChild();
        const tile2 = tile.addChild();
        queue.push([child1, tile1]);
        queue.push([child2, tile2]);
      }
    }
    return rootTile;
  }
  addWindow(window) {
    if (this.windowSet.has(window)) return;
    this.windowSet.add(window);
    if (this.root.window === null && this.root.children === null) {
      this.root.window = window;
      return;
    }
    const queue = new Queue();
    queue.push(this.root);
    while (!queue.isEmpty) {
      const node = queue.pop();
      if (node.window !== null) {
        node.split(this.settings.swapInsertSide ? 1 : 0);
        node.children[this.settings.swapInsertSide ? 0 : 1].window = window;
        return;
      } else {
        if (node.children !== null) {
          for (let i = node.children.length - 1; i >= 0; i--) {
            queue.push(node.children[i]);
          }
        }
      }
    }
  }
  placeWindow(window, tile, direction) {
    if (this.windowSet.has(window)) {
      if (tile.windows.includes(window)) {
        return;
      }
      this.removeWindow(window);
    }
    this.windowSet.add(window);
    let node = this.tileMap.get(tile);
    console().debug(node);
    if (node == void 0) return;
    if (node.destroyed) {
      node = node.parent;
      if (node == null) return;
    }
    if (node.window === null) {
      node.window = window;
      return;
    }
    let insertPoint = this.settings.swapInsertSide ? 0 : 1;
    if (direction !== void 0) {
      insertPoint = node.layoutDirection === 1 /* Horizontal */ ? direction & 2 /* Right */ ? 1 : 0 : direction & 1 /* Down */ ? 1 : 0;
    }
    node.split(insertPoint === 0 ? 1 : 0);
    node.children[insertPoint].window = window;
  }
  removeWindow(window) {
    if (!this.windowSet.has(window)) {
      return;
    }
    this.windowSet.delete(window);
    if (this.root.window === window) {
      this.root.window = null;
      return;
    }
    const queue = new Queue();
    queue.push(this.root);
    while (!queue.isEmpty) {
      const node = queue.pop();
      if (node.window === window) {
        node.destroy();
        return;
      } else {
        if (node.children !== null) {
          queue.multipush(node.children);
        }
      }
    }
  }
  updateTiles(_rootTile) {
    for (const [tile, node] of this.tileMap) {
      node.size = tile.size;
    }
  }
};

// src/engine/layouts/half.ts
var WindowBox = class {
  constructor(window) {
    this.size = 1;
    this.window = window;
  }
};
var HalfEngineSettings = class extends BaseEngineSettings {
  constructor() {
    super(...arguments);
    this.middleSplit = 0.5;
    this.swapInsertSide = false;
    this.rotateLayout = false;
  }
};
var HalfEngine = class {
  constructor() {
    this.tileMap = /* @__PURE__ */ new Map();
    this.side1 = [];
    this.side2 = [];
    this.settings = new HalfEngineSettings();
  }
  getEngineSettings() {
    return this.settings.getProps();
  }
  setEngineSettings(settings) {
    this.settings.setProps(settings);
  }
  buildLayout() {
    const rootTile = new Tile();
    rootTile.layoutDirection = this.settings.rotateLayout ? 2 /* Vertical */ : 1 /* Horizontal */;
    this.tileMap.clear();
    if (this.side1.length == 0 && this.side2.length == 0) return rootTile;
    if (this.side1.length == 0 || this.side2.length == 0) {
      const dominantSide = this.side1.length == 0 ? this.side2 : this.side1;
      if (rootTile.layoutDirection == 1 /* Horizontal */) {
        rootTile.layoutDirection = 2 /* Vertical */;
      } else {
        rootTile.layoutDirection = 1 /* Horizontal */;
      }
      for (const box of dominantSide) {
        const tile = rootTile.addChild();
        tile.windows.push(box.window);
        tile.size = box.size;
        this.tileMap.set(tile, box);
      }
      return rootTile;
    }
    const side1Tile = rootTile.addChild();
    const side2Tile = rootTile.addChild();
    side1Tile.size = this.settings.middleSplit * 2;
    side2Tile.size = (1 - this.settings.middleSplit) * 2;
    for (const box of this.side1) {
      const tile = side1Tile.addChild();
      tile.windows.push(box.window);
      tile.size = box.size;
      this.tileMap.set(tile, box);
    }
    for (const box of this.side2) {
      const tile = side2Tile.addChild();
      tile.windows.push(box.window);
      tile.size = box.size;
      this.tileMap.set(tile, box);
    }
    return rootTile;
  }
  addWindow(window) {
    if (!this.settings.swapInsertSide) {
      if (this.side1.length == 0) {
        this.side1.push(new WindowBox(window));
      } else {
        this.side2.push(new WindowBox(window));
      }
    } else {
      if (this.side2.length == 0) {
        this.side2.push(new WindowBox(window));
      } else {
        this.side1.push(new WindowBox(window));
      }
    }
  }
  removeWindow(window) {
    let idx = this.side1.findIndex((x) => x.window == window);
    if (idx != -1) {
      this.side1.splice(idx, 1);
      if (this.side1.length == 0 && this.side2.length > 1) {
        this.side1.push(this.side2.splice(0, 1)[0]);
      }
      return;
    }
    idx = this.side2.findIndex((x) => x.window == window);
    if (idx == -1) return;
    this.side2.splice(idx, 1);
    if (this.side2.length == 0 && this.side1.length > 1) {
      this.side2.push(this.side1.splice(0, 1)[0]);
    }
  }
  // default to inserting below
  placeWindow(window, tile, direction) {
    if (direction === void 0) {
      direction = 4 /* Vertical */;
    }
    if (this.tileMap.get(tile)?.window === window) {
      return;
    }
    if (this.side1.some((x) => x.window) || this.side2.some((x) => x.window)) {
      this.removeWindow(window);
    }
    const targetBox = this.tileMap.get(tile);
    if (targetBox == void 0) {
      this.addWindow(window);
      return;
    }
    if (direction !== void 0 && this.settings.rotateLayout) {
      direction = translateDirection(direction);
    }
    const newBox = new WindowBox(window);
    const [side, otherSide] = this.side1.includes(targetBox) ? [this.side1, this.side2] : [this.side2, this.side1];
    const idx = side.indexOf(targetBox);
    if (otherSide.length == 0) {
      if (side == this.side2 != ((direction & 2 /* Right */) != 0)) {
        otherSide.push(newBox);
      } else {
        otherSide.push(side.splice(0, 1)[0]);
        side.push(newBox);
      }
    } else {
      if (direction & 1 /* Down */) {
        side.splice(idx + 1, 0, newBox);
      } else {
        side.splice(idx, 0, newBox);
      }
    }
  }
  updateTiles(rootTile) {
    if (rootTile.children.length == 2) {
      this.settings.middleSplit = rootTile.children[0].size / rootTile.totalChildrenSize();
    }
  }
};

// src/engine/index.ts
var TilingEngine = class {
  constructor(type, settings) {
    this.engineType = type;
    switch (type) {
      case 0 /* BTree */:
        this.engine = new BTreeEngine();
        break;
      case 1 /* Half */:
        this.engine = new HalfEngine();
        break;
      default:
        console().warn("Invalid tiling engine type", type);
        this.engineType = 0 /* BTree */;
        this.engine = new BTreeEngine();
        break;
    }
    this.engine.setEngineSettings(settings);
    this.engineRootTile = this.engine.buildLayout();
  }
  getEngineSettings() {
    return this.engine.getEngineSettings();
  }
  setEngineSettings(settings) {
    this.engine.setEngineSettings(settings);
  }
  buildLayout() {
    this.engineRootTile = this.engine.buildLayout();
    return this.engineRootTile;
  }
  addWindow(window) {
    return this.engine.addWindow(window);
  }
  placeWindow(window, tile, direction) {
    return this.engine.placeWindow(window, tile, direction);
  }
  removeWindow(window) {
    return this.engine.removeWindow(window);
  }
  updateTiles(rootTile) {
    return this.engine.updateTiles(rootTile);
  }
};

// src/controller/config.ts
var Config = class {
  constructor(kwinApi) {
    const rc = kwinApi.readConfig;
    this.rebuildDelay = rc("RebuildDelay", 10);
    this.tileResizeAmount = rc("TileResizeAmount", 10);
    this.fullRebuild = rc("FullRebuild", true);
    this.preserveOldDrivers = rc("PreserveOldDrivers", true);
    this.useDBusSaver = rc("UseDBusSaver", false);
    this.logLevel = rc("LogLevel", 1 /* Warn */);
    this.defaultEngine = rc("DefaultEngine", 0 /* BTree */);
    this.btreeSettings = {
      swapInsertSide: rc("BTreeSwapInsertSide", false),
      rotateLayout: rc("BTreeRotateLayout", false)
    };
    this.halfSettings = {
      swapInsertSide: rc("HalfSwapInsertSide", false),
      middleSplit: rc("HalfMiddleSplit", 0.5),
      rotateLayout: rc("HalfRotateLayout", false)
    };
    const ignoreRaw = rc(
        "IgnoreWindowClasses",
        "krunner, yakuake, kded, polkit, plasmashell, xwaylandvideobridge"
      ).split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    this.ignoreWindowClasses = ignoreRaw.length > 0
      ? new RegExp(ignoreRaw.join("|"))
      : null;
    const floatingRaw = rc("FloatingWindowClasses", "discord")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    this.floatingWindowClasses = floatingRaw.length > 0
      ? new RegExp(floatingRaw.join("|"))
      : null;
    this.borders = rc("Borders", 4 /* BorderAll */);
    this.tiledWindowsBelow = rc("TiledWindowsBelow", true);
    this.tilePopups = rc("TilePopups", false);
  }
};

// src/controller/handlers/workspace.ts
var WorkspaceHandler = class {
  constructor(workspace) {
    this.workspace = workspace;
    this.previousActivated = this.workspace.activeWindow;
    this.workspace.windowAdded.connect(this.windowAdded.bind(this));
    this.workspace.windowRemoved.connect(this.windowRemoved.bind(this));
    this.workspace.windowActivated.connect(this.windowActivated.bind(this));
    this.workspace.currentDesktopChanged.connect(
      this.rebuildDesktops.bind(this)
    );
    this.workspace.currentActivityChanged.connect(
      this.rebuildDesktops.bind(this)
    );
    this.workspace.screensChanged.connect(this.updateDrivers.bind(this));
    this.workspace.desktopsChanged.connect(this.updateDrivers.bind(this));
    this.workspace.activityAdded.connect(this.updateDrivers.bind(this));
    this.workspace.activityRemoved.connect(this.updateDrivers.bind(this));
    this.workspace.activitiesChanged.connect(this.updateDrivers.bind(this));
  }
  windowAdded(window) {
    const windowHandler = controller().createWindowHandler(window);
    if (!windowHandler.tiled) return;
    if (!controller().isTilingEnabled()) return;
    for (const ev of createTileEvents(
      window,
      window.desktops,
      window.activities,
      window.output
    )) {
      controller().queueEvent(ev);
    }
  }
  windowRemoved(window) {
    for (const ev of createUntileEvents(
      window,
      window.desktops,
      window.activities,
      window.output
    )) {
      controller().queueEvent(ev);
    }
    controller().queueEvent({
      t: "removeWindow",
      window
    });
  }
  rebuildDesktops() {
    controller().queueEvent({ t: "rebuildDesktops" });
  }
  updateDrivers() {
    controller().queueEvent({ t: "updateDrivers" });
  }
  windowActivated(window) {
    if (config().borders == 2 /* BorderActive */ || config().borders == 3 /* BorderFloatingActive */) {
      if (windowIsTiled(window)) {
        controller().queuePostEvent({
          t: "setWindowProperties",
          window,
          noBorder: false
        });
      }
      if (this.previousActivated != null && (windowIsTiled(this.previousActivated) || config().borders == 2 /* BorderActive */)) {
        controller().queuePostEvent({
          t: "setWindowProperties",
          window: this.previousActivated,
          noBorder: true
        });
      }
    }
    this.previousActivated = window;
  }
};
function windowIsTiled(window) {
  return window.tile != null || controller().getWindowHandler(window)?.tiled;
}

// src/controller/handlers/shortcuts.ts
var ShortcutsHandler = class {
  constructor(workspace, shortcuts) {
    this.workspace = workspace;
    this.shortcuts = shortcuts;
    this.shortcuts.getToggleTiling().activated.connect(this.toggleTiling.bind(this));
    this.shortcuts.getToggleActiveTiling().activated.connect(this.toggleActiveTiling.bind(this));
    this.shortcuts.getSetEngineBTree().activated.connect(
      this.setEngineType.bind(this, 0 /* BTree */)
    );
    this.shortcuts.getSetEngineHalf().activated.connect(
      this.setEngineType.bind(this, 1 /* Half */)
    );
    this.shortcuts.getActivateBelow().activated.connect(
      this.activateInDirection.bind(this, 8 /* BottomEdge */)
    );
    this.shortcuts.getActivateAbove().activated.connect(
      this.activateInDirection.bind(this, 1 /* TopEdge */)
    );
    this.shortcuts.getActivateLeft().activated.connect(
      this.activateInDirection.bind(this, 2 /* LeftEdge */)
    );
    this.shortcuts.getActivateRight().activated.connect(
      this.activateInDirection.bind(this, 4 /* RightEdge */)
    );
    this.shortcuts.getPlaceBelow().activated.connect(
      this.placeInDirection.bind(this, 8 /* BottomEdge */)
    );
    this.shortcuts.getPlaceAbove().activated.connect(this.placeInDirection.bind(this, 1 /* TopEdge */));
    this.shortcuts.getPlaceLeft().activated.connect(this.placeInDirection.bind(this, 2 /* LeftEdge */));
    this.shortcuts.getPlaceRight().activated.connect(
      this.placeInDirection.bind(this, 4 /* RightEdge */)
    );
    this.shortcuts.getResizeDown().activated.connect(
      this.resizeInDirection.bind(this, 8 /* BottomEdge */)
    );
    this.shortcuts.getResizeUp().activated.connect(this.resizeInDirection.bind(this, 1 /* TopEdge */));
    this.shortcuts.getResizeLeft().activated.connect(
      this.resizeInDirection.bind(this, 2 /* LeftEdge */)
    );
    this.shortcuts.getResizeRight().activated.connect(
      this.resizeInDirection.bind(this, 4 /* RightEdge */)
    );
    this.shortcuts.getToggleSettingsMenu().activated.connect(this.toggleSettingsMenu.bind(this));
  }
  toggleActiveTiling() {
    const window = this.workspace.activeWindow;
    if (window == null) return;
    const windowHandler = controller().getWindowHandler(window);
    if (windowHandler == void 0) return;
    if (windowHandler.tiled) {
      windowHandler.wantsTiled = false;
      windowHandler.tiled = false;
      for (const ev of createUntileEvents(window)) {
        controller().queueEvent(ev);
      }
      controller().queuePostEvent({ t: "centerWindow", window });
    } else {
      windowHandler.wantsTiled = true;
      windowHandler.tiled = true;
      for (const ev of createTileEvents(window)) {
        controller().queueEvent(ev);
      }
    }
  }
  toggleTiling() {
    controller().toggleAllTiling();
  }
  setEngineType(engineType) {
    controller().queueEvent({
      t: "changeEngine",
      desktop: this.workspace.currentDesktop,
      activity: this.workspace.currentActivity,
      output: this.workspace.activeScreen,
      engineType
    });
  }
  getTileInDirection(tile, rootTile, edge) {
    if (tile == rootTile) return null;
    let x = tile.absoluteGeometry.x;
    let y = tile.absoluteGeometry.y;
    switch (edge) {
      case 8 /* BottomEdge */:
        x += tile.absoluteGeometry.width / 2;
        y += tile.absoluteGeometry.height + tile.padding * 2;
        break;
      case 1 /* TopEdge */:
        x += tile.absoluteGeometry.width / 2;
        y -= tile.padding * 2;
        break;
      case 2 /* LeftEdge */:
        x -= tile.padding * 2;
        y += tile.absoluteGeometry.height / 2;
        break;
      case 4 /* RightEdge */:
        x += tile.absoluteGeometry.width + tile.padding * 2;
        y += tile.absoluteGeometry.height / 2;
        break;
      default:
        return null;
    }
    return rootTile.pick(qt().point(x, y));
  }
  activateInDirection(edge) {
    const currentTile = this.workspace.activeWindow?.tile;
    if (currentTile == null) return;
    let rootTile = currentTile;
    while (rootTile.parent != null) {
      rootTile = rootTile.parent;
    }
    const targetTile = this.getTileInDirection(currentTile, rootTile, edge);
    if (targetTile == null) return;
    if (targetTile.windows.length == 0) return;
    this.workspace.activeWindow = targetTile.windows[0];
  }
  placeInDirection(edge) {
    const currentTile = this.workspace.activeWindow?.tile;
    if (currentTile == null) return;
    let rootTile = currentTile;
    while (rootTile.parent != null) {
      rootTile = rootTile.parent;
    }
    const targetTile = this.getTileInDirection(currentTile, rootTile, edge);
    if (targetTile == null) return;
    let direction = 0 /* None */;
    switch (edge) {
      case 1 /* TopEdge */:
        direction = 4 /* Vertical */;
        break;
      case 8 /* BottomEdge */:
        direction = 1 /* Down */ | 4 /* Vertical */;
        break;
      case 2 /* LeftEdge */:
        direction = 0 /* None */;
        break;
      case 4 /* RightEdge */:
        direction = 2 /* Right */;
        break;
      default:
        break;
    }
    if (edge & 8 /* BottomEdge */ || edge & 1 /* TopEdge */) {
      const currentCenter = currentTile.absoluteGeometry.x + currentTile.absoluteGeometry.width / 2;
      const targetCenter = targetTile.absoluteGeometry.x + targetTile.absoluteGeometry.width / 2;
      if (currentCenter > targetCenter) {
        direction |= 2 /* Right */;
      }
    } else if (edge & 2 /* LeftEdge */ || edge & 4 /* RightEdge */) {
      const currentCenter = currentTile.absoluteGeometry.y + currentTile.absoluteGeometry.height / 2;
      const targetCenter = targetTile.absoluteGeometry.y + targetTile.absoluteGeometry.height / 2;
      if (currentCenter > targetCenter) {
        direction |= 1 /* Down */;
      }
    }
    const window = this.workspace.activeWindow;
    controller().queueEvent({
      t: "placeWindow",
      window,
      desktop: this.workspace.currentDesktop,
      activity: this.workspace.currentActivity,
      output: window.output,
      tile: targetTile,
      direction
    });
  }
  resizeInDirection(edge) {
    const currentTile = this.workspace.activeWindow?.tile;
    if (currentTile == null) return;
    let amount = config().tileResizeAmount;
    if (edge & 1 /* TopEdge */ || edge & 2 /* LeftEdge */) {
      amount *= -1;
    }
    currentTile.resizeByPixels(amount, edge);
  }
  toggleSettingsMenu() {
    controller().queuePostEvent({
      t: "toggleSettingsMenu",
      desktop: this.workspace.currentDesktop,
      activity: this.workspace.currentActivity,
      output: this.workspace.activeScreen
    });
  }
};

// src/controller/handlers/settings.ts
var SettingsHandler = class {
  constructor(settingsQml) {
    this.settingsQml = settingsQml;
    this.settingsQml.saveSettings.connect(this.saveSettings.bind(this));
    this.settingsQml.resetSettings.connect(this.resetSettings.bind(this));
  }
  show(desktop, activity, output, engineType, engineSettings) {
    console().debug("showing settings");
    this.settingsQml.show(
      desktop,
      activity,
      output,
      engineType,
      engineSettings
    );
  }
  hide() {
    this.settingsQml.hide();
  }
  isVisible() {
    return this.settingsQml.visible;
  }
  saveSettings(desktop, activity, output, engineType, engineSettings) {
    controller().queueEvent({
      t: "changeEngine",
      desktop,
      activity,
      output,
      engineType,
      engineSettings
    });
  }
  resetSettings(desktop, activity, output) {
    controller().queueEvent({
      t: "resetEngine",
      desktop,
      activity,
      output
    });
  }
};

// src/controller/handlers/dbus.ts
function settingsBundle(engineType, engineSettings) {
  const bundle = {
    engineType,
    engineSettings
  };
  return JSON.stringify(bundle);
}
var DBusHandler = class {
  constructor(dbusQml) {
    this.dbusQml = dbusQml;
    dbusQml.getSettings().finished.connect(this.getSettingsCallback.bind(this));
  }
  getSettings(desktop, activity, output) {
    console().debug("getSettings called");
    this.dbusQml.getSettings().arguments = [
      desktopId(desktop, activity, output)
    ];
    this.dbusQml.getSettings().call();
  }
  getSettingsCallback([
    desktopIdStr,
    settingsBundleStr
  ]) {
    console().debug(
      "getSettings dbus callback activated -",
      desktopIdStr,
      settingsBundleStr
    );
    try {
      const desktopId2 = controller().parseDesktopId(desktopIdStr);
      if (desktopId2.some((x) => x === void 0)) return;
      const settingsBundle2 = JSON.parse(
        settingsBundleStr
      );
      controller().queueEvent(
        {
          t: "changeEngine",
          desktop: desktopId2[0],
          activity: desktopId2[1],
          output: desktopId2[2],
          engineType: settingsBundle2.engineType,
          engineSettings: settingsBundle2.engineSettings,
          noDBusUpdate: true
        },
        true
      );
    } catch (e) {
      console().error(e);
    }
  }
  setSettings(desktop, activity, output, engineType, engineSettings) {
    console().debug("setSettings called");
    this.dbusQml.setSettings().arguments = [
      desktopId(desktop, activity, output),
      settingsBundle(engineType, engineSettings)
    ];
    this.dbusQml.setSettings().call();
  }
  resetSettings(desktop, activity, output) {
    console().debug("resetSettings called");
    this.dbusQml.resetSettings().arguments = [
      desktopId(desktop, activity, output)
    ];
    this.dbusQml.resetSettings().call();
  }
};

// src/controller/console.ts
var Console = class {
  constructor(console3) {
    this.console = console3;
  }
  debug(...args) {
    if (config().logLevel < 3 /* Debug */) return;
    this.console.info("Polonium DBG:", ...args);
  }
  log(...args) {
    if (config().logLevel < 2 /* Log */) return;
    this.console.info("Polonium LOG:", ...args);
  }
  warn(...args) {
    if (config().logLevel < 1 /* Warn */) return;
    this.console.warn("Polonium WRN:", ...args);
  }
  error(...args) {
    this.console.error("Polonium ERR:", ...args);
  }
};

// src/driver/buildlayout.ts
function buildLayout(kwinRootTile, engineRootTile) {
  const tileMap = /* @__PURE__ */ new Map();
  const queue = new Queue();
  queue.push([kwinRootTile, engineRootTile]);
  while (!queue.isEmpty) {
    const [kwinTile, engineTile] = queue.pop();
    if (kwinTile == null) {
      console().warn("kwin tile is null");
      continue;
    }
    tileMap.set(kwinTile, engineTile);
    console().debug("forming tile", kwinTile.absoluteGeometry);
    if (kwinTile.layoutDirection !== engineTile.layoutDirection) {
      while (kwinTile.tiles.length > 0) {
        kwinTile.tiles[kwinTile.tiles.length - 1].remove();
      }
      kwinTile.layoutDirection = engineTile.layoutDirection;
    }
    console().debug("kwin children", kwinTile.tiles.length);
    console().debug("engine children", engineTile.children.length);
    if (engineTile.children.length == 1) {
      while (kwinTile.tiles.length > 0) {
        kwinTile.tiles[kwinTile.tiles.length - 1].remove();
      }
      queue.push([kwinTile, engineTile.children[0]]);
    } else {
      matchChildren(kwinTile, engineTile);
    }
    if (engineTile.children.length > 1) {
      for (let i = 0; i < engineTile.children.length; i += 1) {
        queue.push([kwinTile.tiles[i], engineTile.children[i]]);
      }
    }
  }
  return tileMap;
}
function matchChildren(kwinTile, engineTile) {
  const layoutDirection = engineTile.layoutDirection;
  const tileCountToLeave = config().fullRebuild ? 0 : engineTile.children.length;
  while (kwinTile.tiles.length > tileCountToLeave) {
    kwinTile.tiles[kwinTile.tiles.length - 1].remove();
  }
  if (engineTile.children.length === 0) return;
  for (let i = 0; i < kwinTile.tiles.length - 1; i += 1) {
    setChildRelativeSize(kwinTile, engineTile, i);
  }
  while (kwinTile.tiles.length < engineTile.children.length) {
    if (kwinTile.tiles.length == 0) {
      kwinTile.split(layoutDirection);
      setChildRelativeSize(kwinTile, engineTile, 0);
    } else {
      kwinTile.tiles[kwinTile.tiles.length - 1].split(layoutDirection);
      setChildRelativeSize(
        kwinTile,
        engineTile,
        kwinTile.tiles.length - 2
      );
    }
  }
  setChildRelativeSize(kwinTile, engineTile, kwinTile.tiles.length - 1);
}
function setChildRelativeSize(kwinTile, engineTile, index) {
  const totalSize = engineTile.totalChildrenSize();
  const kwinChild = kwinTile.tiles[index];
  const engineChild = engineTile.children[index];
  if (engineTile.layoutDirection === 1 /* Horizontal */) {
    kwinChild.relativeGeometry.width = kwinTile.relativeGeometry.width * (engineChild.size / totalSize);
  } else if (engineTile.layoutDirection === 2 /* Vertical */) {
    kwinChild.relativeGeometry.height = kwinTile.relativeGeometry.height * (engineChild.size / totalSize);
  }
}

// src/driver/index.ts
var Driver = class {
  constructor(rootTile, desktop, activity, output, engineType, engineSettings) {
    this.tileMap = /* @__PURE__ */ new Map();
    this.windowMap = /* @__PURE__ */ new Map();
    this.windowsToUnmanage = [];
    this.active = true;
    this.rootTile = rootTile;
    this.desktop = desktop;
    this.activity = activity;
    this.output = output;
    if (engineSettings === void 0) {
      engineSettings = getConfigEngineSettings(engineType);
    }
    this.tilingEngine = new TilingEngine(engineType, engineSettings);
  }
  refreshDriver(rootTile, desktop, activity, output) {
    this.rootTile = rootTile;
    this.desktop = desktop;
    this.activity = activity;
    this.output = output;
    for (const [kwinWindow, engineWindow] of this.windowMap) {
      if (kwinWindow == null || !controller().windowExists(kwinWindow)) {
        if (kwinWindow.desktops.includes(this.desktop) || kwinWindow.activities.includes(this.activity) || kwinWindow.output == this.output)
          continue;
        this.tilingEngine.removeWindow(engineWindow);
        this.windowMap.delete(kwinWindow);
      }
    }
  }
  setEngineType(engineType, engineSettings) {
    this.tilingEngine = new TilingEngine(engineType, engineSettings);
    for (const engineWindow of this.windowMap.values()) {
      this.tilingEngine.addWindow(engineWindow);
    }
  }
  changeTilingEngine(engineType, engineSettings) {
    if (engineType !== void 0 && this.tilingEngine.engineType != engineType) {
      if (engineSettings === void 0) {
        engineSettings = getConfigEngineSettings(engineType);
      }
      this.setEngineType(engineType, engineSettings);
    } else if (engineSettings !== void 0) {
      this.tilingEngine.setEngineSettings(engineSettings);
    }
  }
  resetTilingEngine() {
    const defaultEngine = config().defaultEngine;
    const defaultSettings = getConfigEngineSettings(defaultEngine);
    if (this.tilingEngine.engineType !== defaultEngine) {
      this.setEngineType(defaultEngine, defaultSettings);
    } else {
      this.tilingEngine.setEngineSettings(defaultSettings);
    }
  }
  buildLayout() {
    if (this.rootTile == null) {
      console().warn("root tile is null on active driver");
      return;
    }
    const engineRootTile = this.tilingEngine.buildLayout();
    const previousTileSet = new Set(this.tileMap.keys());
    this.tileMap = buildLayout(this.rootTile, engineRootTile);
    const invertedWindowMap = new Map(
      Array.from(this.windowMap, (a) => [a[1], a[0]])
    );
    const tiledWindowsList = [];
    for (const [kwinTile, engineTile] of this.tileMap) {
      if (!previousTileSet.has(kwinTile)) {
        kwinTile.relativeGeometryChanged.connect(
          this.updateTileSizesCallback.bind(this)
        );
      }
      for (const engineWindow of engineTile.windows) {
        const kwinWindow = invertedWindowMap.get(engineWindow);
        if (kwinWindow != void 0 && controller().windowExists(kwinWindow)) {
          setTiledProps(kwinWindow);
          if (kwinWindow.tile !== kwinTile)
            kwinTile.manage(kwinWindow);
          tiledWindowsList.push(kwinWindow);
        }
      }
    }
    for (const kwinWindow of this.windowMap.keys()) {
      if (!tiledWindowsList.includes(kwinWindow)) {
        if (controller().windowExists(kwinWindow)) {
          setUntiledProps(kwinWindow);
          if (kwinWindow.tile != null && this.tileMap.has(kwinWindow.tile)) {
            kwinWindow.tile.unmanage(kwinWindow);
          }
        }
      }
    }
    for (const kwinWindow of this.windowsToUnmanage) {
      if (controller().windowExists(kwinWindow)) {
        setUntiledProps(kwinWindow);
        if (kwinWindow.tile != null && this.tileMap.has(kwinWindow.tile)) {
          kwinWindow.tile.unmanage(kwinWindow);
        }
      }
    }
    this.windowsToUnmanage = [];
  }
  initializeWindow(kwinWindow) {
    if (this.windowMap.has(kwinWindow)) {
      return this.windowMap.get(kwinWindow);
    }
    const engineWindow = new Window(
      kwinWindow.internalId,
      kwinWindow.caption,
      kwinWindow.minSize
    );
    this.windowMap.set(kwinWindow, engineWindow);
    return engineWindow;
  }
  addWindow(kwinWindow) {
    if (this.windowMap.has(kwinWindow)) {
      console().warn(
        "initializeWindow error - window already exists in map"
      );
      return;
    }
    const window = this.initializeWindow(kwinWindow);
    if (window === void 0) {
    }
    this.tilingEngine.addWindow(window);
  }
  placeWindow(kwinWindow, kwinTile, direction) {
    let window = this.initializeWindow(kwinWindow);
    const tile = this.tileMap.get(kwinTile);
    if (tile == void 0) {
      console().warn("tile undefined during window placement");
      this.tilingEngine.addWindow(window);
      return;
    }
    this.tilingEngine.placeWindow(window, tile, direction);
  }
  removeWindow(kwinWindow) {
    const engineWindow = this.windowMap.get(kwinWindow);
    if (engineWindow === void 0) {
      console().warn(
        "Window",
        kwinWindow.resourceClass,
        "not registered in windowMap"
      );
      return;
    }
    this.windowsToUnmanage.push(kwinWindow);
    this.tilingEngine.removeWindow(engineWindow);
    this.windowMap.delete(kwinWindow);
  }
  // as of right now, can only update sizes (ie cannot add/remove tiles)
  updateTiles() {
    const oldTotalChildrenSizes = /* @__PURE__ */ new Map();
    for (const engineTile of this.tileMap.values()) {
      oldTotalChildrenSizes.set(
        engineTile,
        engineTile.totalChildrenSize()
      );
    }
    for (const [kwinTile, engineTile] of this.tileMap) {
      if (kwinTile.parent == null || engineTile.parent == null) continue;
      let size;
      if (engineTile.parent.layoutDirection === 1 /* Horizontal */) {
        size = kwinTile.relativeGeometry.width /= kwinTile.parent.relativeGeometry.width;
      } else {
        size = kwinTile.relativeGeometry.height /= kwinTile.parent.relativeGeometry.height;
      }
      size *= oldTotalChildrenSizes.get(engineTile.parent);
      engineTile.size = size;
    }
    this.tilingEngine.updateTiles(this.tileMap.get(this.rootTile));
  }
  updateTileSizesCallback() {
    controller().queuePostEvent({
      t: "updateTileSizes",
      desktop: this.desktop,
      activity: this.activity,
      output: this.output
    });
  }
};
function getConfigEngineSettings(engineType) {
  let ret;
  switch (engineType) {
    case 0 /* BTree */:
      ret = config().btreeSettings;
      break;
    case 1 /* Half */:
      ret = config().halfSettings;
      break;
    default:
      console().error("engine type", engineType, "is invalid");
      ret = {};
      break;
  }
  return ret;
}
function setTiledProps(window) {
  if (config().tiledWindowsBelow) {
    window.keepBelow = true;
  }
  if (config().borders != 4 /* BorderAll */) {
    window.noBorder = true;
  }
  window.setMaximize(false, false);
}
function setUntiledProps(window) {
  if (config().tiledWindowsBelow) {
    window.keepBelow = false;
  }
  if (config().borders != 0 /* NoBorders */ && config().borders != 2 /* BorderActive */) {
    window.noBorder = false;
  }
}

// src/controller/index.ts
var Controller = class {
  constructor(qmlApi, qmlObjects) {
    this.eventQueue = new Queue();
    this.postEventQueue = new Queue();
    this.processingEvents = false;
    this.drivers = /* @__PURE__ */ new Map();
    this.windowHandlers = /* @__PURE__ */ new Map();
    this.workspaceHandler = null;
    this.shortcutsHandler = null;
    this.dbusHandler = null;
    this.tilingEnabled = true;
    this.workspace = qmlApi.workspace;
    this.qmlObjects = qmlObjects;
    this.eventTimer = this.qmlObjects.eventTimer;
    this.geometryTimer = this.qmlObjects.geometryTimer;
    this.eventTimer.interval = config().rebuildDelay;
    this.eventTimer.repeat = false;
    this.eventTimer.triggered.connect(this.processEvents.bind(this));
    this.settingsHandler = new SettingsHandler(this.qmlObjects.settings);
    if (config().useDBusSaver) {
      this.dbusHandler = new DBusHandler(this.qmlObjects.dbus);
    }
  }
  // call this after to prevent issues with workspaceHandler before the object is officially constructed
  initHandlers() {
    this.workspaceHandler = new WorkspaceHandler(this.workspace);
    for (const window of this.workspace.windows) {
      this.workspaceHandler.windowAdded(window);
    }
    this.shortcutsHandler = new ShortcutsHandler(
      this.workspace,
      this.qmlObjects.shortcuts
    );
    this.updateDrivers();
  }
  queueEvent(ev, forcePush = false) {
    if (this.processingEvents && !forcePush) return;
    this.eventQueue.push(ev);
    this.eventTimer.start();
  }
  queuePostEvent(ev, forcePush = false) {
    if (this.processingEvents && !forcePush) return;
    this.postEventQueue.push(ev);
    this.eventTimer.start();
  }
  processEvents() {
    this.processingEvents = true;
    const queue = simplifyEvents(this.eventQueue);
    this.eventQueue = new Queue();
    console().debug("Handling", queue.size, "event(s)");
    const rebuild = queue.size != 0;
    while (!queue.isEmpty) {
      this.handleEvent(queue.pop());
    }
    if (rebuild) {
      for (const output of this.workspace.screens) {
        const id = desktopId(
          this.workspace.currentDesktop,
          this.workspace.currentActivity,
          output
        );
        console().debug("Rebuilding for output", output.name);
        if (this.drivers.has(id)) {
          this.drivers.get(id)?.buildLayout();
        } else {
          console().error("no driver found for desktop id", id);
        }
      }
    }
    const postQueue = simplifyPostEvents(this.postEventQueue);
    this.postEventQueue = new Queue();
    console().debug("Handling", postQueue.size, "post event(s)");
    while (!postQueue.isEmpty) {
      this.handlePostEvent(postQueue.pop());
    }
    this.processingEvents = false;
  }
  handleEvent(ev) {
    console().debug("handling event", ev.t);
    switch (ev.t) {
      case "tileWindow": {
        console().log(
          "adding window",
          ev.window.resourceClass,
          "to desktop",
          ev.desktop.name,
          "on output",
          ev.output.name,
          "and activity",
          ev.activity
        );
        this.getDriver(ev.desktop, ev.activity, ev.output)?.addWindow(
          ev.window
        );
        break;
      }
      case "untileWindow": {
        if (ev.output == void 0 || ev.desktop == void 0 || ev.activity == void 0)
          break;
        console().log(
          "removing window",
          ev.window.resourceClass,
          "from desktop",
          ev.desktop.name,
          "on output",
          ev.output.name,
          "and activity",
          ev.activity
        );
        const driver = this.drivers.get(
          desktopId(ev.desktop, ev.activity, ev.output)
        );
        if (driver !== void 0 && driver.windowMap.has(ev.window)) {
          driver.removeWindow(ev.window);
        }
        break;
      }
      case "updateDrivers": {
        this.updateDrivers();
        break;
      }
      case "rebuildDesktops": {
        break;
      }
      // call untileWindow before this
      case "removeWindow": {
        console().log("destroying window", ev.window.resourceClass);
        this.windowHandlers.delete(ev.window);
        break;
      }
      case "placeWindow": {
        console().log(
          "placing window",
          ev.window.resourceClass,
          "in tile at",
          ev.tile.absoluteGeometry
        );
        this.getDriver(ev.desktop, ev.activity, ev.output)?.placeWindow(
          ev.window,
          ev.tile,
          ev.direction
        );
        break;
      }
      case "updateTileCount": {
        console().log(
          "updating tile count for desktop",
          ev.desktop.name,
          "on output",
          ev.output.name,
          "and activity",
          ev.activity
        );
        this.getDriver(
          ev.desktop,
          ev.activity,
          ev.output
        )?.updateTiles();
        break;
      }
      case "changeEngine": {
        console().log(
          "changing engine type/settings for desktop",
          ev.desktop.name,
          "on output",
          ev.output.name,
          "and activity",
          ev.activity
        );
        const driver = this.getDriver(
          ev.desktop,
          ev.activity,
          ev.output
        );
        if (driver === void 0) break;
        driver.changeTilingEngine(ev.engineType, ev.engineSettings);
        if (this.settingsHandler.isVisible()) {
          this.showSettingsHandler(driver);
        }
        if (ev.noDBusUpdate === void 0 || !ev.noDBusUpdate) {
          this.dbusHandler?.setSettings(
            ev.desktop,
            ev.activity,
            ev.output,
            driver.tilingEngine.engineType,
            driver.tilingEngine.getEngineSettings()
          );
        }
        break;
      }
      case "resetEngine": {
        console().log(
          "resetting to default engine settings for desktop",
          ev.desktop.name,
          "on output",
          ev.output.name,
          "and activity",
          ev.activity
        );
        const driver = this.getDriver(
          ev.desktop,
          ev.activity,
          ev.output
        );
        if (driver === void 0) break;
        driver.resetTilingEngine();
        if (this.settingsHandler.isVisible()) {
          this.showSettingsHandler(driver);
        }
        this.dbusHandler?.resetSettings(
          ev.desktop,
          ev.activity,
          ev.output
        );
        break;
      }
    }
  }
  handlePostEvent(ev) {
    console().debug("handling post event", ev.t);
    switch (ev.t) {
      case "setWindowProperties": {
        if (!this.windowExists(ev.window)) break;
        console().log(
          "setting properties for window",
          ev.window.resourceClass
        );
        if (ev.fullscreen !== void 0) {
          ev.window.fullScreen = ev.fullscreen;
        }
        if (ev.noBorder !== void 0) {
          ev.window.noBorder = ev.noBorder;
        }
        break;
      }
      case "centerWindow": {
        if (!this.windowExists(ev.window)) break;
        const targetWindow = ev.window;
        const apply = () => {
          if (!controller().windowExists(targetWindow)) return;
          this.geometryTimer.triggered.disconnect(apply);
          const screen = targetWindow.output.geometry;
          const width = Math.round(screen.width * 0.55);
          const height = Math.round(screen.height * 0.65);
          targetWindow.frameGeometry = {
            x: screen.x + Math.round((screen.width - width) / 2),
            y: screen.y + Math.round((screen.height - height) / 2),
            width,
            height
          };
        };
        this.geometryTimer.triggered.connect(apply);
        this.geometryTimer.start();
        break;
      }
      case "updateTileSizes": {
        console().log(
          "updating tile sizes for desktop",
          ev.desktop.name,
          "on output",
          ev.output.name,
          "and activity",
          ev.activity
        );
        this.getDriver(
          ev.desktop,
          ev.activity,
          ev.output
        )?.updateTiles();
        break;
      }
      case "toggleSettingsMenu": {
        console().log("toggling settings menu");
        if (this.settingsHandler.isVisible()) {
          this.settingsHandler.hide();
        } else {
          this.showSettingsHandler(
            this.getDriver(ev.desktop, ev.activity, ev.output)
          );
        }
        break;
      }
    }
  }
  parseDesktopId(id) {
    let parsed;
    try {
      parsed = JSON.parse(id);
    } catch (_) {
      return [void 0, void 0, void 0];
    }
    const desktop = this.workspace.desktops.find((d) => d.id === parsed.d);
    const activity = this.workspace.activities.find((a) => a === parsed.a);
    const output = this.workspace.screens.find((s) => s.name === parsed.o);
    return [desktop, activity, output];
  }
  // gets a driver, if it doesn't exist then it calls updateDrivers and tries to get it again.
  // if it still doesn't exist, then it returns undefined.
  getDriver(desktop, activity, output) {
    const id = desktopId(desktop, activity, output);
    let driver = this.drivers.get(id);
    if (driver !== void 0) return driver;
    console().warn(
      "driver not found for id",
      id,
      "updating drivers and trying again"
    );
    this.updateDrivers();
    driver = this.drivers.get(id);
    return driver;
  }
  updateDrivers() {
    for (const id of this.drivers.keys()) {
      const [desktop, activity, output] = this.parseDesktopId(id);
      if (!desktop || !activity || !output) {
        console().debug("removing driver", id);
        if (config().preserveOldDrivers && this.drivers.has(id)) {
          this.drivers.get(id).active = false;
        } else {
          this.drivers.delete(id);
        }
      }
    }
    const allDesktops = [];
    for (const output of this.workspace.screens) {
      for (const activity of this.workspace.activities) {
        for (const desktop of this.workspace.desktops) {
          allDesktops.push([desktop, activity, output]);
        }
      }
    }
    for (const [desktop, activity, output] of allDesktops) {
      const id = desktopId(desktop, activity, output);
      const driver = this.drivers.get(id);
      const rootTile = this.workspace.rootTile(output, desktop);
      if (driver === void 0) {
        console().debug("adding driver", id);
        const driver2 = new Driver(
          rootTile,
          desktop,
          activity,
          output,
          config().defaultEngine
        );
        this.drivers.set(id, driver2);
        this.dbusHandler?.getSettings(desktop, activity, output);
      } else if (!driver.active) {
        console().debug("reactivating driver", id);
        driver.active = true;
        driver.refreshDriver(rootTile, desktop, activity, output);
      }
    }
  }
  showSettingsHandler(driver) {
    if (driver === void 0) return;
    const engineType = driver.tilingEngine.engineType;
    const engineSettings = driver.tilingEngine.getEngineSettings();
    this.settingsHandler.show(
      driver.desktop,
      driver.activity,
      driver.output,
      engineType,
      engineSettings
    );
  }
  createWindowHandler(window) {
    console().log("registering window", window.resourceClass);
    const handler = new WindowHandler(window, this.workspace);
    this.windowHandlers.set(window, handler);
    return handler;
  }
  getWindowHandler(window) {
    return this.windowHandlers.get(window);
  }
  isTilingEnabled() {
    return this.tilingEnabled;
  }
  toggleAllTiling() {
    this.tilingEnabled = !this.tilingEnabled;
    this.workspace.osd.show(
      this.tilingEnabled ? "Polonium: Tiling Enabled" : "Polonium: Tiling Disabled",
      this.tilingEnabled ? "view-list-details" : "view-list-details-off"
    );
    if (this.tilingEnabled) {
      for (const [window, windowHandler] of this.windowHandlers) {
        if (windowHandler.wantsTiled && windowHandler.canBeTiled() && !windowHandler.tiled) {
          windowHandler.tiled = true;
          for (const ev of createTileEvents(window)) {
            this.queueEvent(ev);
          }
        }
      }
    } else {
      for (const [window, windowHandler] of this.windowHandlers) {
        if (windowHandler.tiled) {
          windowHandler.tiled = false;
          for (const ev of createUntileEvents(window)) {
            this.queueEvent(ev);
          }
        }
      }
    }
  }
  // sometimes the window can be destroyed before rebuild but the ref will still exist, so make sure it exists before calling stuff on it
  windowExists(window) {
    return this.workspace.windows.includes(window);
  }
};
var controllerObj;
var consoleObj;
var configObj;
var qtObject;
function initializeController(qmlApi, qmlObjects) {
  configObj = new Config(qmlApi.kwin);
  consoleObj = new Console(qmlApi.console);
  qtObject = qmlApi.qt;
  console().debug("config -", JSON.stringify(config()));
  controllerObj = new Controller(qmlApi, qmlObjects);
  controllerObj.initHandlers();
  console().log("controller initialized. Welcome to Polonium!");
}
function controller() {
  return controllerObj;
}
function console() {
  return consoleObj;
}
function config() {
  return configObj;
}
function qt() {
  return qtObject;
}
function desktopId(desktop, activity, output) {
  return `{"d":"${desktop.id}","a":"${activity}","o":"${output.name}"}`;
}

// src/index.ts
function main(api, qmlObjects) {
  const ctrl = initializeController(api, qmlObjects);
}
export {
  main
};
