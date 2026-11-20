let backgroundImage; // 儲存背景圖片。
let stopSprite; // 儲存角色待機精靈圖。
let runSprite; // 儲存角色跑步精靈圖。
let lightningSprite; // 儲存閃電精靈圖。
let explosionSprite; // 儲存爆破精靈圖。
let thunderSound; // 儲存打雷音效。
let backgroundOffset = 0; // 記錄背景平移的位置。
let characterX = 0; // 記錄角色中心的水平位置。
let frameIndex = 0; // 記錄目前播放的精靈格數。
let lastFrameTime = 0; // 記錄上次切換動畫影格的時間。
let isMoving = false; // 記錄角色是否正在移動。
let runIntroComplete = false; // 記錄跑步動畫是否已播放完第一輪。
let facingRight = true; // 記錄角色目前面向的方向。
let effectActive = false; // 記錄背景位置的特效循環是否正在播放。
let effectTriggeredAtBoundary = false; // 記錄目前這次右側背景邊界是否已啟動特效。
let effectMode = "lightning"; // 記錄目前播放閃電或爆破特效。
let effectFrame = 0; // 記錄目前特效精靈圖的影格。
let lightningPlayCount = 0; // 記錄目前連續播放閃電的次數。
let effectStepStartedAt = 0; // 記錄目前特效階段的開始時間。
let effectStartBackgroundOffset = 0; // 記錄特效錨點啟動時的背景位置。
let thunderPlaying = false; // 記錄打雷音效目前是否正在播放。
let thunderCharacterReachedStrike = false; // 記錄角色是否曾經抵達閃電位置。
let thunderStartedForLightning = false; // 記錄目前這次閃電是否已啟動過打雷音效。
let thunderSegmentStartedAt = 0; // 記錄目前這段打雷音效的開始時間。
const spriteFrameCount = 12; // 設定每張精靈圖的格數。
const lightningFrameCount = 14; // 設定閃電精靈圖的格數。
const explosionFrameCount = 10; // 設定爆破精靈圖的格數。
const animationInterval = 90; // 設定每格動畫播放的毫秒間隔。
const backgroundSpeed = 4; // 設定背景每次移動的像素數。
const characterSpeed = 4; // 設定背景到達邊界後角色每次移動的像素數。
const lightningDuration = 1000; // 設定每次閃電動畫播放一秒。
const explosionDuration = 1000; // 設定每次爆破動畫播放一秒。
const thunderSegmentDuration = 5000; // 設定每段打雷音效播放五秒。

function preload() { // 在畫布建立前載入遊戲圖片。
  backgroundImage = loadImage("bg/bg1.png"); // 載入背景圖片。
  stopSprite = loadImage("2/stop/stop.png"); // 載入角色待機精靈圖。
  runSprite = loadImage("2/run/run.png"); // 載入角色跑步精靈圖。
  lightningSprite = loadImage("et/et1/et1.png"); // 載入閃電精靈圖。
  explosionSprite = loadImage("et/et2/et2.png"); // 載入爆破精靈圖。
  thunderSound = loadSound("audio/thunder.mp3"); // 載入打雷音效。
} // 結束圖片載入函式。

function setup() { // 設定畫布與繪圖模式。
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布。
  imageMode(CORNER); // 設定圖片以左上角作為繪製座標。
  frameRate(60); // 設定畫面更新頻率。
  lastFrameTime = millis(); // 初始化動畫影格計時。
  characterX = width / 2; // 將角色初始位置設定在畫面中央。
} // 結束畫布設定函式。

function draw() { // 每個畫面更新背景與角色。
  const movingLeft = keyIsDown(LEFT_ARROW); // 確認鍵盤左方向鍵是否按住。
  const movingRight = keyIsDown(RIGHT_ARROW); // 確認鍵盤右方向鍵是否按住。
  const currentSprite = movingLeft || movingRight ? runSprite : stopSprite; // 依方向鍵狀態選擇跑步或待機精靈圖。
  const frameWidth = currentSprite.width / spriteFrameCount; // 計算每格精靈圖的實際寬度。
  const scaleFactor = min(1, (height * 0.55) / currentSprite.height); // 依畫布高度縮放角色並避免放大素材。
  const characterWidth = frameWidth * scaleFactor; // 計算角色目前影格的顯示寬度。
  const characterHeight = currentSprite.height * scaleFactor; // 計算角色目前影格的顯示高度。
  const wasMoving = isMoving; // 暫存上一個畫面的移動狀態。
  const previousBackgroundOffset = backgroundOffset; // 暫存背景原本的位置以判斷是否移動。
  const previousCharacterX = characterX; // 暫存角色原本的位置以判斷是否移動。

  if (movingRight && !movingLeft) { // 單獨按下右方向鍵時。
    facingRight = true; // 設定角色朝向右方。
    if (characterX < width / 2) { // 角色在中央左側時先回到中央。
      characterX = min(width / 2, characterX + characterSpeed); // 將角色往右移回畫面中央。
    } else if (backgroundOffset > -width) { // 背景尚未移動到右側邊界時。
      backgroundOffset = max(-width, backgroundOffset - backgroundSpeed); // 讓背景向左移動並停在右側邊界。
    } else { // 背景到達右側邊界後。
      characterX = min(width - characterWidth / 2, characterX + characterSpeed); // 改由角色往右走至視窗邊緣。
    } // 結束向右移動處理。
  } else if (movingLeft && !movingRight) { // 單獨按下左方向鍵時。
    facingRight = false; // 設定角色朝向左方。
    if (characterX > width / 2) { // 角色在中央右側時先回到中央。
      characterX = max(width / 2, characterX - characterSpeed); // 將角色往左移回畫面中央。
    } else if (backgroundOffset < width) { // 背景尚未移動到左側邊界時。
      backgroundOffset = min(width, backgroundOffset + backgroundSpeed); // 讓背景向右移動並停在左側邊界。
    } else { // 背景到達左側邊界後。
      characterX = max(characterWidth / 2, characterX - characterSpeed); // 改由角色往左走至視窗邊緣。
    } // 結束向左移動處理。
  } // 結束方向鍵移動判斷。

  if (backgroundOffset > -width) { // 背景離開右側移動邊界時。
    effectTriggeredAtBoundary = false; // 允許下次抵達右側邊界時重新啟動特效。
  } // 結束右側邊界特效重設。
  if (backgroundOffset <= -width && !effectTriggeredAtBoundary && !effectActive) { // 右側副本停止移動並抵達畫面左緣時。
    effectActive = true; // 啟動閃電與爆破特效循環。
    effectTriggeredAtBoundary = true; // 標記這次邊界已啟動過特效。
    effectMode = "lightning"; // 從閃電特效開始播放。
    effectFrame = 0; // 將特效影格重設為第一格。
    lightningPlayCount = 0; // 將閃電播放次數歸零。
    effectStepStartedAt = millis(); // 記錄閃電動畫開始時間。
    effectStartBackgroundOffset = backgroundOffset; // 記錄特效錨定背景的位置。
  } // 結束特效啟動判斷。

  isMoving = backgroundOffset !== previousBackgroundOffset || characterX !== previousCharacterX; // 僅在背景或角色實際移動時播放跑步動畫。
  if (isMoving && !wasMoving) { // 偵測從待機開始實際移動的時刻。
    frameIndex = 0; // 從跑步動畫第 1 格開始播放。
    runIntroComplete = false; // 重新啟用跑步動畫的完整首輪。
    lastFrameTime = millis(); // 重設跑步動畫計時。
  } else if (!isMoving && wasMoving) { // 偵測從實際移動回到待機的時刻。
    frameIndex = 0; // 從待機動畫第 1 格開始播放。
    runIntroComplete = false; // 清除上一輪跑步動畫的播放狀態。
    lastFrameTime = millis(); // 重設待機動畫計時。
  } // 結束動畫狀態切換。

  image(backgroundImage, backgroundOffset - width, 0, width, height); // 繪製左側的背景副本。
  image(backgroundImage, backgroundOffset, 0, width, height); // 繪製中央的背景圖片。
  image(backgroundImage, backgroundOffset + width, 0, width, height); // 繪製右側的背景副本。

  const displayedSprite = isMoving ? runSprite : stopSprite; // 依實際移動狀態選擇跑步或待機精靈圖。
  const displayedFrameWidth = displayedSprite.width / spriteFrameCount; // 計算顯示中精靈圖每格的實際寬度。
  const displayedScaleFactor = min(1, (height * 0.55) / displayedSprite.height); // 依畫布高度計算顯示中角色的縮放比例。
  const displayedCharacterWidth = displayedFrameWidth * displayedScaleFactor; // 計算顯示中角色影格的寬度。
  const displayedCharacterHeight = displayedSprite.height * displayedScaleFactor; // 計算顯示中角色影格的高度。
  const characterY = height * 0.94 - displayedCharacterHeight / 2; // 將角色垂直位置固定在畫布底部附近。

  push(); // 儲存目前的繪圖狀態。
  translate(characterX, characterY); // 將座標原點移至角色中心。
  scale(facingRight ? 1 : -1, 1); // 依角色方向決定是否水平翻轉。
  image(displayedSprite, -displayedCharacterWidth / 2, -displayedCharacterHeight / 2, displayedCharacterWidth, displayedCharacterHeight, frameIndex * displayedFrameWidth, 0, displayedFrameWidth, displayedSprite.height); // 繪製精靈圖目前影格。
  pop(); // 還原繪圖狀態。
  drawBackgroundEffects(); // 繪製位於角色前方且錨定於右側副本的閃電與爆破特效。

  if (millis() - lastFrameTime >= animationInterval) { // 到達動畫影格切換時間時。
    lastFrameTime = millis(); // 更新上次切換影格的時間。
    if (isMoving && !runIntroComplete) { // 播放跑步動畫的第一輪完整影格。
      if (frameIndex < spriteFrameCount - 1) { // 尚未播放完第 1 至第 12 格時。
        frameIndex += 1; // 播放下一格跑步動畫。
      } else { // 第 12 格播放完成時。
        frameIndex = 5; // 從第 6 格開始進入循環播放。
        runIntroComplete = true; // 標記跑步動畫第一輪已完成。
      } // 結束跑步動畫第一輪判斷。
    } else if (isMoving) { // 持續移動且已完成第一輪跑步動畫時。
      frameIndex = frameIndex >= spriteFrameCount - 1 ? 5 : frameIndex + 1; // 循環播放第 6 至第 12 格。
    } else { // 角色處於待機狀態時。
      frameIndex = (frameIndex + 1) % spriteFrameCount; // 循環播放待機動畫的 12 格。
    } // 結束動畫影格更新。
  } // 結束動畫計時判斷。
} // 結束畫面更新函式。

function drawBackgroundEffects() { // 更新並繪製背景位置觸發的特效循環。
  if (!effectActive) { // 尚未啟動特效時。
    thunderStartedForLightning = false; // 重設本次閃電的音效啟動狀態。
    stopThunderAudio(); // 停止已離開背景位置的打雷音效。
    return; // 結束特效處理。
  } // 結束特效啟動狀態判斷。

  const effectX = width * 0.75 + backgroundOffset - effectStartBackgroundOffset; // 計算錨點距離視窗右側四分之一的位置。
  if (effectX > width) { // 錨定的背景位置已離開視窗右側時。
    effectActive = false; // 停止目前的閃電與爆破循環。
    effectMode = "lightning"; // 將下次播放狀態重設為閃電。
    effectFrame = 0; // 將下次播放影格重設為第一格。
    lightningPlayCount = 0; // 將下次閃電播放次數重設為零。
    thunderStartedForLightning = false; // 重設已離開視窗位置的音效啟動狀態。
    stopThunderAudio(); // 背景位置離開視窗時停止打雷音效。
    return; // 不再繪製已離開視窗的特效。
  } // 結束錨點離開視窗的處理。

  let elapsed = millis() - effectStepStartedAt; // 計算目前特效階段已播放的時間。
  while (elapsed >= (effectMode === "lightning" ? lightningDuration : explosionDuration)) { // 特效階段完整播放後才切換下一階段。
    const stepDuration = effectMode === "lightning" ? lightningDuration : explosionDuration; // 取得目前特效階段的播放時長。
    effectStepStartedAt += stepDuration; // 將起始時間推進到下一個特效階段。
    if (effectMode === "lightning") { // 閃電階段完整播放結束時。
      lightningPlayCount += 1; // 累加已完整播放的閃電次數。
      if (lightningPlayCount >= 3) { // 三次閃電都播放完成時。
        effectMode = "explosion"; // 接著完整播放一次爆破特效。
        thunderStartedForLightning = false; // 標記閃電階段已結束。
      } // 結束閃電次數判斷。
    } else { // 爆破階段完整播放結束時。
      effectMode = "lightning"; // 爆破完整播放後才重新開始閃電。
      lightningPlayCount = 0; // 將新一輪閃電次數歸零。
    } // 結束特效階段切換。
    elapsed = millis() - effectStepStartedAt; // 更新切換後新階段已播放的時間。
  } // 結束特效階段完整播放判斷。
  updateThunderAudio(effectX); // 依角色與閃電位置更新打雷音效播放狀態。

  if (effectMode === "lightning") { // 目前播放閃電特效時。
    effectFrame = min(lightningFrameCount - 1, floor((elapsed / lightningDuration) * lightningFrameCount)); // 依一秒播放進度選擇閃電影格。
    const lightningFrameWidth = lightningSprite.width / lightningFrameCount; // 計算閃電精靈圖每格的寬度。
    const lightningScale = min((height * 0.75) / lightningSprite.height, (width * 0.18) / lightningFrameWidth); // 計算由畫面上方向下延伸的閃電尺寸。
    const lightningWidth = lightningFrameWidth * lightningScale; // 計算閃電影格的顯示寬度。
    const lightningHeight = lightningSprite.height * lightningScale; // 計算閃電影格的顯示高度。
    image(lightningSprite, effectX - lightningWidth / 2, 0, lightningWidth, lightningHeight, effectFrame * lightningFrameWidth, 0, lightningFrameWidth, lightningSprite.height); // 從畫面上方繪製目前閃電影格。
  } else { // 目前播放爆破特效時。
    effectFrame = min(explosionFrameCount - 1, floor((elapsed / explosionDuration) * explosionFrameCount)); // 依一秒播放進度選擇爆破影格。
    const lightningFrameWidth = lightningSprite.width / lightningFrameCount; // 計算閃電精靈圖每格的寬度。
    const lightningScale = min((height * 0.75) / lightningSprite.height, (width * 0.18) / lightningFrameWidth); // 計算閃電精靈圖的顯示比例。
    const explosionY = height * (2 / 3); // 將爆破特效的上緣放在距視窗底部三分之一的位置。
    const explosionFrameWidth = explosionSprite.width / explosionFrameCount; // 計算爆破精靈圖每格的寬度。
    const explosionScale = min(1.5, (width * 0.4) / explosionFrameWidth); // 計算視窗底端爆破特效的顯示大小。
    const explosionWidth = explosionFrameWidth * explosionScale; // 計算爆破影格的顯示寬度。
    const explosionHeight = explosionSprite.height * explosionScale; // 計算爆破影格的顯示高度。
    image(explosionSprite, effectX - explosionWidth / 2, explosionY, explosionWidth, explosionHeight, effectFrame * explosionFrameWidth, 0, explosionFrameWidth, explosionSprite.height); // 緊貼閃電下方繪製目前爆破影格。
  } // 結束閃電與爆破影格繪製。
} // 結束背景特效更新與繪製函式。

function updateThunderAudio(effectX) { // 啟動、重播或停止打雷音效。
  if (effectMode === "lightning" && !thunderStartedForLightning) { // 閃電顯示且這一輪尚未啟動打雷音效時。
    if (!thunderPlaying) { // 打雷音效尚未播放時。
      playThunderSegment(); // 開始播放一段五秒的打雷音效。
      thunderCharacterReachedStrike = false; // 清除上一輪角色抵達閃電位置的狀態。
    } // 結束打雷音效播放狀態判斷。
    thunderStartedForLightning = true; // 避免角色離開後在同一輪閃電中重啟音效。
  } // 結束閃電音效啟動判斷。

  if (!thunderPlaying) { // 打雷音效未播放時。
    return; // 結束音效更新。
  } // 結束音效播放狀態判斷。

  const currentSprite = isMoving ? runSprite : stopSprite; // 依角色狀態選擇目前顯示的角色精靈圖。
  const characterScale = min(1, (height * 0.55) / currentSprite.height); // 計算角色目前的顯示比例。
  const characterHalfWidth = (currentSprite.width / spriteFrameCount) * characterScale / 2; // 計算角色影格的一半寬度作為閃電位置範圍。
  if (abs(characterX - effectX) <= characterHalfWidth) { // 角色抵達閃電所在的水平位置時。
    thunderCharacterReachedStrike = true; // 記錄角色已進入閃電位置。
  } else if (thunderCharacterReachedStrike) { // 角色離開已抵達的閃電位置時。
    stopThunderAudio(); // 停止打雷音效。
    return; // 角色離開後不再重播音效。
  } // 結束角色與閃電位置的距離判斷。

  if (millis() - thunderSegmentStartedAt >= thunderSegmentDuration) { // 目前音效播放滿五秒時。
    thunderSound.stop(); // 停止上一段打雷音效。
    playThunderSegment(); // 立即重新播放下一段五秒音效。
  } // 結束五秒音效重播判斷。
} // 結束打雷音效更新函式。

function playThunderSegment() { // 播放一段五秒的打雷音效。
  thunderSound.play(0, 1, 1, 0, thunderSegmentDuration / 1000); // 從音效開頭播放五秒。
  thunderPlaying = true; // 記錄打雷音效已開始播放。
  thunderSegmentStartedAt = millis(); // 記錄這段音效的播放起始時間。
} // 結束打雷音效播放函式。

function stopThunderAudio() { // 停止打雷音效並重設角色位置狀態。
  if (thunderPlaying) { // 打雷音效正在播放時。
    thunderSound.stop(); // 停止打雷音效播放。
    thunderPlaying = false; // 記錄打雷音效已停止。
    thunderCharacterReachedStrike = false; // 重設角色是否抵達閃電位置的狀態。
  } // 結束音效停止判斷。
} // 結束打雷音效停止函式。

function keyPressed() { // 處理方向鍵按下事件。
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) { // 僅處理左、右方向鍵。
    userStartAudio(); // 透過方向鍵操作解除瀏覽器的音訊播放限制。
    facingRight = keyCode === RIGHT_ARROW; // 依剛按下的方向鍵設定角色面向。
    return false; // 阻止方向鍵造成瀏覽器頁面捲動。
  } // 結束方向鍵判斷。
} // 結束方向鍵按下事件。

function keyReleased() { // 處理方向鍵放開事件。
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) { // 僅處理左、右方向鍵。
    return false; // 阻止方向鍵造成瀏覽器頁面捲動。
  } // 結束方向鍵判斷。
} // 結束方向鍵放開事件。

function windowResized() { // 瀏覽器視窗尺寸改變時調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布配合新的視窗大小。
  characterX = constrain(characterX, 0, width); // 將角色位置限制在調整後的新畫布內。
  backgroundOffset = constrain(backgroundOffset, -width, width); // 將背景位置限制在調整後的新畫布範圍內。
} // 結束視窗尺寸調整函式。
