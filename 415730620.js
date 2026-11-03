// 宣告全域變數
let questions = [];      // 儲存 6 個題目的陣列
let draggableItems = []; // 儲存 6 個可拖曳文字選項的陣列
let targetBoxes = [];    // 儲存上方 6 個圖片目標框的陣列
let draggedItem = null;  // 當前正在被拖曳的物件
let submitButton;        // 交卷按鈕
let showScore = false;   // 是否顯示成績
let finalScore = 0;      // 最終得分
let confettiList = [];   // 彩帶粒子陣列

function setup() {
  // 建立全螢幕畫布，支援響應式網頁佈局
  createCanvas(windowWidth, windowHeight);
  
  // 初始化測驗資料（幼兒園生活常識）
  initQuizData();
  
  // 建立與佈局網頁UI組件
  layoutGame();
  
  // 建立交卷按鈕
  submitButton = createButton('交卷看成績');
  submitButton.style('font-size', '20px');
  submitButton.style('padding', '12px 24px');
  submitButton.style('background-color', '#4CAF50');
  submitButton.style('color', 'white');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '12px');
  submitButton.style('cursor', 'pointer');
  submitButton.mousePressed(calculateScore); // 設定點擊事件
  submitButton.hide(); // 初始狀態先隱藏，等待所有項目皆拖曳定位後顯示
}

function draw() {
  // 設定溫馨的幼兒園風格背景顏色（淡黃色）
  background(255, 250, 230);
  
  // 繪製標題與說明文字
  drawHeader();
  
  // 繪製上方的圖片目標區域
  for (let box of targetBoxes) {
    box.display();
  }
  
  // 繪製下方的可拖曳文字選項（非拖曳中的先畫，拖曳中的最後畫以維持在最上層）
  for (let item of draggableItems) {
    if (item !== draggedItem) {
      item.display();
    }
  }
  if (draggedItem) {
    draggedItem.display(); // 確保拖曳中的項目不會被其他元件遮擋
  }
  
  // 檢查是否所有選項都已經拖曳到適當位置
  checkAllPlaced();
  
  // 如果已經交卷，顯示成績面板
  if (showScore) {
    drawScoreBoard();
    // 如果成績高於 80 分，更新並繪製彩帶特效
    if (finalScore >= 80) {
      updateAndDrawConfetti();
    }
  }
}

// 初始化 6 個幼兒園生活常識題目與對應的 GIF 圖片 URL
function initQuizData() {
  questions = [
    {
      id: 1,
      label: '飯前洗手',
      // 可替換為你真實的 GIF 圖片連結
      imgUrl: 'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif' 
    },
    {
      id: 2,
      label: '過馬路走斑馬線',
      imgUrl: 'https://media.giphy.com/media/l41Yq0IPbd4YF3BG8/giphy.gif'
    },
    {
      id: 3,
      label: '睡覺前刷牙',
      imgUrl: 'https://media.giphy.com/media/3o6Zt8zbS9dC3GakqA/giphy.gif'
    },
    {
      id: 4,
      label: '玩具玩完要收好',
      imgUrl: 'https://media.giphy.com/media/l2JHRhAtnJSDNJ2py/giphy.gif'
    },
    {
      id: 5,
      label: '見到老師說你好',
      imgUrl: 'https://media.giphy.com/media/xT9IgG50ksy7Mxei8U/giphy.gif'
    },
    {
      id: 6,
      label: '垃圾扔進垃圾桶',
      imgUrl: 'https://media.giphy.com/media/3oFzmb1e4gX92c7uA8/giphy.gif'
    }
  ];
}

// 根據螢幕尺寸響應式計算目標區與拖曳項目的位置
function layoutGame() {
  targetBoxes = [];
  draggableItems = [];
  
  let cols = 3; // 一行放置 3 個卡片
  let rows = 2; // 共 2 行，總共 6 個選項
  
  let boxWidth = min(width * 0.26, 200);   // 動態計算圖片框寬度
  let boxHeight = boxWidth * 0.8;          // 動態計算圖片框高度
  let spacingX = (width - cols * boxWidth) / (cols + 1); // 水平間距
  let startY = 100;                        // 上方圖片區起始 Y 座標
  let rowSpacing = boxHeight + 20;         // 行間距
  
  // 建立上方 6 個固定的目標圖片框
  for (let i = 0; i < questions.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = spacingX + col * (boxWidth + spacingX);
    let y = startY + row * rowSpacing;
    
    // 載入 GIF 圖片檔案
    let img = createImg(questions[i].imgUrl, '常識動態圖');
    img.size(boxWidth - 20, boxHeight - 20);
    img.position(x + 10, y + 10);
    
    targetBoxes.push(new TargetBox(x, y, boxWidth, boxHeight, questions[i], img));
  }
  
  // 將選項順序打亂（隨機排列），增加測驗趣味性
  let shuffledQuestions = shuffle([...questions]);
  
  // 建立下方 6 個可拖曳的文字選項
  let bottomStartY = startY + rows * rowSpacing + 50; // 下方文字選項起始 Y 座標
  for (let i = 0; i < shuffledQuestions.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = spacingX + col * (boxWidth + spacingX);
    let y = bottomStartY + row * 70;
    
    draggableItems.push(new DraggableItem(x, y, boxWidth, 50, shuffledQuestions[i]));
  }
}

// 繪製標題與指示
function drawHeader() {
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(80, 50, 20);
  textStyle(BOLD);
  text('幼兒園生活常識大挑戰', width / 2, 40);
  
  textSize(16);
  textStyle(NORMAL);
  fill(120, 90, 60);
  text('請把下方的文字拉到正確的圖案位置下方喔！', width / 2, 75);
}

// 檢查是否所有文字都已拖曳到目標區域，若是則顯示交卷按鈕
function checkAllPlaced() {
  let allPlaced = draggableItems.every(item => item.isPlaced);
  if (allPlaced && !showScore) {
    // 將交卷按鈕定位在畫面中央底部
    submitButton.position(width / 2 - 60, height - 80);
    submitButton.show();
  } else if (showScore) {
    submitButton.hide();
  }
}

// 計算得分與判斷是否產生彩帶
function calculateScore() {
  let correctCount = 0;
  
  // 比對每個拖曳選項是否放入了正確的目標圖片區域
  for (let item of draggableItems) {
    if (item.currentTarget && item.currentTarget.data.id === item.data.id) {
      correctCount++;
    }
  }
  
  // 計算百分比分數
  finalScore = Math.round((correctCount / questions.length) * 100);
  showScore = true; // 啟用分數顯示面板
  
  // 若分數高於 80%，生成彩帶粒子特效
  if (finalScore >= 80) {
    createConfetti();
  }
}

// 繪製成績顯示彈窗面板
function drawScoreBoard() {
  // 半透明背景遮罩
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  // 中央成績卡片
  fill(255);
  stroke(255, 200, 0);
  strokeWeight(5);
  rectMode(CENTER);
  rect(width / 2, height / 2, 360, 240, 20);
  rectMode(CORNER);
  noStroke();
  
  // 分數文字顯示
  textAlign(CENTER, CENTER);
  fill(50);
  textSize(24);
  text('測驗結束！', width / 2, height / 2 - 70);
  
  textSize(40);
  textStyle(BOLD);
  if (finalScore >= 80) {
    fill(46, 125, 50); // 高分顯示綠色
  } else {
    fill(211, 47, 47); // 低分顯示紅色
  }
  text('得分: ' + finalScore + ' 分', width / 2, height / 2 - 10);
  
  // 評語
  textSize(20);
  textStyle(NORMAL);
  fill(80);
  if (finalScore >= 80) {
    text('太棒了！你是生活小達人！', width / 2, height / 2 + 50);
  } else {
    text('再接再厲，下次一定會更好！', width / 2, height / 2 + 50);
  }
}

// 滑鼠按下時觸發拖曳
function mousePressed() {
  if (showScore) return; // 交卷後不允許拖曳
  
  // 從最後繪製的項目開始檢測，確保選取到最上層項目
  for (let i = draggableItems.length - 1; i >= 0; i--) {
    let item = draggableItems[i];
    if (item.isMouseOver()) {
      draggedItem = item;
      item.isDragging = true;
      item.offsetX = mouseX - item.x;
      item.offsetY = mouseY - item.y;
      
      // 如果原本已經在目標框中，解除綁定
      if (item.currentTarget) {
        item.currentTarget.occupiedItem = null;
        item.currentTarget = null;
        item.isPlaced = false;
      }
      break;
    }
  }
}

// 滑鼠拖曳中，更新物件座標
function mouseDragged() {
  if (draggedItem) {
    draggedItem.x = mouseX - draggedItem.offsetX;
    draggedItem.y = mouseY - draggedItem.offsetY;
  }
}

// 滑鼠放開時觸發吸附與位置判定
function mouseReleased() {
  if (draggedItem) {
    let placed = false;
    
    // 檢查是否拖曳到某個目標框上方
    for (let box of targetBoxes) {
      if (box.isPointInside(mouseX, mouseY) && !box.occupiedItem) {
        // 吸附到目標框下方的指定位置
        draggedItem.x = box.x;
        draggedItem.y = box.y + box.h + 10;
        draggedItem.isPlaced = true;
        draggedItem.currentTarget = box;
        box.occupiedItem = draggedItem;
        placed = true;
        break;
      }
    }
    
    // 如果沒有放置到有效的目標框，則彈回原初始位置
    if (!placed) {
      draggedItem.resetPosition();
    }
    
    draggedItem.isDragging = false;
    draggedItem = null;
  }
}

// 響應式網頁尺寸改變時，重新計算畫布與UI佈局
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // 移除舊的 HTML GIF 元素
  for (let box of targetBoxes) {
    if (box.imgElement) {
      box.imgElement.remove();
    }
  }
  
  // 重新進行介面佈局
  layoutGame();
  
  // 若按鈕已顯示，更新按鈕位置
  if (submitButton) {
    submitButton.position(width / 2 - 60, height - 80);
  }
}

// ===== 類別定義：目標框類別 (TargetBox) =====
class TargetBox {
  constructor(x, y, w, h, data, imgElement) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.data = data;
    this.imgElement = imgElement; // HTML 圖像元素 (GIF)
    this.occupiedItem = null;    // 目前放置在該框上的拖曳文字物件
  }

  display() {
    // 繪製卡片圓角邊框與背景
    fill(255);
    stroke(200, 180, 150);
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h, 12);
  }

  // 判斷座標點是否落於此目標框之範圍內
  isPointInside(px, py) {
    return (px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h);
  }
}

// ===== 類別定義：可拖曳文字選項類別 (DraggableItem) =====
class DraggableItem {
  constructor(x, y, w, h, data) {
    this.initX = x;    // 初始 X 座標 (用於歸位)
    this.initY = y;    // 初始 Y 座標 (用於歸位)
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.data = data;  // 題目資料
    this.isDragging = false;
    this.isPlaced = false;
    this.currentTarget = null;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  display() {
    // 繪製文字按鈕外觀
    if (this.isDragging) {
      fill(255, 230, 150); // 拖曳中樣式
      stroke(255, 150, 0);
      strokeWeight(3);
    } else if (this.isPlaced) {
      fill(220, 245, 220); // 定位完成樣式
      stroke(76, 175, 80);
      strokeWeight(2);
    } else {
      fill(240, 240, 255); // 預設樣式
      stroke(150, 150, 220);
      strokeWeight(2);
    }
    
    rect(this.x, this.y, this.w, this.h, 10);
    
    // 繪製選項文字
    noStroke();
    fill(40);
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text(this.data.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  // 檢查滑鼠是否懸停在選項上方
  isMouseOver() {
    return (mouseX >= this.x && mouseX <= this.x + this.w && mouseY >= this.y && mouseY <= this.y + this.h);
  }

  // 重置回初始位置
  resetPosition() {
    this.x = this.initX;
    this.y = this.initY;
    this.isPlaced = false;
    this.currentTarget = null;
  }
}

// ===== 彩帶粒子系統 (Confetti Effect) =====

// 初始化產生 150 個彩帶碎片粒子
function createConfetti() {
  confettiList = [];
  let colors = ['#FF1744', '#F50057', '#D500F9', '#651FFF', '#3D5AFE', '#00E676', '#FFEA00', '#FF9100'];
  for (let i = 0; i < 150; i++) {
    confettiList.push({
      x: random(width),
      y: random(-height, 0),             // 從畫面上方落下
      size: random(8, 15),
      color: random(colors),
      speedY: random(2, 6),              // 下落速度
      speedX: random(-2, 2),             // 水平飄移速度
      rotation: random(0, TWO_PI),
      rotSpeed: random(-0.1, 0.1)        // 自轉速度
    });
  }
}

// 更新並繪製彩帶動畫
function updateAndDrawConfetti() {
  push();
  rectMode(CENTER);
  noStroke();
  
  for (let c of confettiList) {
    // 位置與角度更新
    c.y += c.speedY;
    c.x += c.speedX;
    c.rotation += c.rotSpeed;
    
    // 超出螢幕底部時回到頂部循環落下
    if (c.y > height) {
      c.y = random(-50, 0);
      c.x = random(width);
    }
    
    // 繪製單個彩帶粒子
    push();
    translate(c.x, c.y);
    rotate(c.rotation);
    fill(c.color);
    rect(0, 0, c.size, c.size / 2);
    pop();
  }
  pop();
}