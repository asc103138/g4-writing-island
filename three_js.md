# Three.js 微縮模型（Diorama）渲染升級與驗收規格書

> **給 Agent 的指引**：本專案為作文教學島嶼系統（`index.html`）。你必須依據本規範重構 Three.js 渲染管線、材質工廠與燈光系統。**嚴禁偷懶將 2D 設計圖貼在幾何體表面上當作模型**，必須透過物理材質與攝影棚光影呈現高品質袖珍盒玩（Resin Diorama）質感。

---

## 一、 核心違規紅線（Violations - 觸犯視為任務失敗）

1. **嚴禁貼圖敷衍（No 2D Plane Texturing）**：
   - 嚴禁使用 `THREE.TextureLoader` 將外部設計圖、概念圖（如 `island_0_origin.png`）直接貼在 `BoxGeometry` 或 `PlaneGeometry` 上交差。
   - 所有建築、島嶼、物件必須以立體 3D 複合網格（Group、多層次幾何體拼裝）建立。
2. **嚴禁全域 FlatShading（Disable Harsh FlatShading）**：
   - 嚴禁全域預設 `flatShading: true`。這會導致球體、圓柱與屋簷產生生硬稜角與破面感，徹底破壞微縮手工模型的打磨質感。
3. **嚴禁曝光洗白與無反光材質（No Basic / Washed-out Materials）**：
   - 全場景嚴禁使用 `MeshBasicMaterial`（除極少數發光粒子外）。
   - 環境光總強度不可超過 0.7，否則會洗白陰影，使微縮模型失去體積感。

---

## 二、 必須執行的四項代碼重構（Implementation Tasks）

### 任務 1：材質快取系統升級（引入程序化樹脂微噪點）
在 `index.html` 的 `<script type="module">` 內，將 `matCache` 與 `getMat` 替換為以下邏輯：
- 動態生成一張 128x128 的灰階噪點 `CanvasTexture`。
- 預設將 `flatShading` 設為 `false`（平滑法線）。
- 將噪點注入 `bumpMap`，並配置 `bumpScale: 0.008`，消除純色塑料感，模擬微縮模型漆面細微顆粒。
- 預設微縮樹脂特性：`roughness: 0.45`, `metalness: 0.05`。

```javascript
// === 程序化微縮模型漆面噪點貼圖 ===
const miniatureNoiseTex = (() => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const imgData = ctx.createImageData(128, 128);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = 128 + (Math.random() * 36 - 18);
    imgData.data[i] = n;
    imgData.data[i + 1] = n;
    imgData.data[i + 2] = n;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
})();

function getMat(color, opts = {}) {
  const key = `${color}_${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color: color,
      roughness: opts.roughness !== undefined ? opts.roughness : 0.42,
      metalness: opts.metalness !== undefined ? opts.metalness : 0.06,
      flatShading: opts.flatShading !== undefined ? opts.flatShading : false,
      bumpMap: opts.bumpMap !== undefined ? opts.bumpMap : miniatureNoiseTex,
      bumpScale: opts.bumpScale !== undefined ? opts.bumpScale : 0.008,
      ...opts
    }));
  }
  return matCache.get(key);
}
```

---

### 任務 2：攝影棚三點光照與柔和接地陰影（Studio Lighting）
重寫 `IslandWorld.prototype.initLights`：
1. **降低環境光**：`AmbientLight` 強度降為 `0.35`，`HemisphereLight` 強度降為 `0.35`。
2. **增強主光與陰影解析度**：
   - `sun`（主光）強度調為 `1.45`，位置設為 `(45, 60, 45)`。
   - `shadow.mapSize.width = 2048`、`shadow.mapSize.height = 2048`。
   - 陰影投射範圍縮緊為 `d = 80`，提升每單位像素的陰影精度，避免虛焦發灰。
3. **加入輪廓光（Rim Light）**：
   - 新增斜後方冷白光 `DirectionalLight(0xcceeff, 0.85)`，位置設在 `(-50, 40, -50)`，勾勒物件邊緣輪廓高光。

```javascript
initLights() {
  const ambient = new THREE.AmbientLight(0xfff8ee, 0.35);
  this.scene.add(ambient);
  this.ambientLight = ambient;

  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x556644, 0.35);
  hemiLight.position.set(0, 50, 0);
  this.scene.add(hemiLight);
  this.hemiLight = hemiLight;

  const sun = new THREE.DirectionalLight(0xfffaed, 1.45);
  sun.position.set(45, 60, 45);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 5;
  sun.shadow.camera.far = 280;
  const d = 80;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  sun.shadow.bias = -0.0003;
  this.scene.add(sun);
  this.sun = sun;

  // 輪廓光：微縮模型高光提亮
  const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.85);
  rimLight.position.set(-50, 40, -50);
  this.scene.add(rimLight);

  const stormPos = CURRICULUM_DATA[2].position;
  const lightning = new THREE.PointLight(0xfef08a, 0, 70);
  lightning.position.set(stormPos[0], stormPos[1] + 20, stormPos[2]);
  this.scene.add(lightning);
  this.lightningLight = lightning;
}
```

---

### 任務 3：微縮長焦鏡頭配置（Tilt-Shift Telephoto Feeling）
修改建構子內的相機 FOV：
- 將原本 `PerspectiveCamera` 的 FOV 45 度降為 **32 度**（長焦微距感），拉遠相機距離至 `(10, 55, 80)`。
- 透視壓縮感會大幅消除「廣角遊戲視角」，呈現擺放在桌面上的微縮袖珍模型感。

```javascript
this.camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 1, 1000);
this.camera.position.set(10, 55, 80);
```

---

### 任務 4：程式碼末端注入自我驗收腳本
在檔案最末端的 `<script>` 尾部，必須加入這段自動驗收診斷器：

```javascript
// === 自動驗收審查腳本 ===
setTimeout(() => {
  console.group("【Three.js 微縮場景驗收報告】");
  console.log("1. 陰影狀態:", app.renderer.shadowMap.enabled ? "✅ 通過" : "❌ 失敗");
  console.log("2. 色調映射:", app.renderer.toneMapping === THREE.ACESFilmicToneMapping ? "✅ 通過 (ACESFilmic)" : "❌ 失敗");
  
  let basicCount = 0;
  let standardCount = 0;
  app.scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      if (obj.material.type === "MeshBasicMaterial") basicCount++;
      if (obj.material.type === "MeshStandardMaterial" || obj.material.type === "MeshPhysicalMaterial") standardCount++;
    }
  });
  console.log(`3. 材質分佈: 物理材質 x${standardCount}, 基礎無光材質 x${basicCount}`);
  if (basicCount > 10) {
    console.warn("⚠️ 警告：仍有大量基礎無光材質未替換！");
  } else {
    console.log("4. 材質合格判定: ✅ 通過 (物理材質為主體)");
  }
  console.groupEnd();
}, 2000);
```

---

## 三、 交付要求
請閱讀本規格書後，直接針對 `index.html` 的相關區塊進行修改，保持原有 UI（稿紙、四格漫畫、彈窗）功能完全可用，並產出重構後完整或對應替換的程式碼。