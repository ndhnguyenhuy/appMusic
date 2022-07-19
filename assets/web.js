const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "Huy";
const player = $(".player");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const pauseBtn = $(".playing");
const progress = $(".progess-bar");
const progressArea = $(".progess-area");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

const app = {
  currentIndex: 0,
  isRandom: false,
  isPlaying: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  song: [
    {
      name: "Tết Đong Đầy",
      singer: "Kay Trần x Lăng LD",
      path: "assets/music/song1-tet dong day.mp3",
      image: "assets/img/song1 (1).jpg",
    },
    {
      name: "Nơi này có anh",
      singer: "Sơn Tùng MTP",
      path: "assets/music/song2-noinaycoanh.mp3",
      image: "assets/img/song2.jpg",
    },
    {
      name: "Hãy Trao Cho Anh",
      singer: "Sơn Tùng MTP",
      path: "assets/music/song3-haytraochoanh.mp3",
      image: "assets/img/song3.jpg",
    },
    {
      name: "Muộn rồi mà sao còn",
      singer: "Sơn Tùng MTP",
      path: "assets/music/song4-muonroisaocon.mp3",
      image: "assets/img/song4.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.song.map((song, index) => {
      return `
      <div class="song ${
        index === this.currentIndex ? "active" : ""
      }" data-index=${index}>
          <div
            class="thumb"
            style="
              background-image: url('${song.image}')
            "
          ></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
      `;
    });
    playList.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.song[this.currentIndex];
      },
    });
  },
  // xử lí phóng to thu nhỏ cd Thumb

  handleEvents: function () {
    const _this = this;
    const cd = $(".cd");
    const cdWidth = cd.offsetWidth;
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newcdWidth = cdWidth - scrollTop;
      cd.style.width = newcdWidth + "px";
      if (newcdWidth < 30) {
        cd.style.display = "none";
      }
      if (newcdWidth > 35) {
        cd.style.display = "block";
      }
      cd.style.opacity = newcdWidth / cdWidth;
    };
    // xu li Cd xoay
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();
    // xử lí khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // khi song duoc play
    audio.onplay = function () {
      _this.isPlaying = true;
      audio.play();
      player.classList.add("playing");
      cdThumbAnimate.play();
      _this.render();
    };

    // Khi song bi pause
    audio.onpause = function () {
      _this.isPlaying = false;
      audio.pause();
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tien do bai hat thay doi

    // if (audio.duration) {
    //   const progressPercent = Math.floor(
    //     (audio.currentTime / audio.duration) * 100
    //   );
    //   progress.value = progressPercent;
    // }
    //  xu li khi tua nhac
    // progress.onchange = function (e) {
    //   const seekTime = (e.target.value / 100) * audio.duration;
    //   audio.currentTime = seekTime;

    audio.addEventListener("timeupdate", function (e) {
      const currentTime = e.target.currentTime;
      const duration = e.target.duration;
      let progessWidth = (currentTime / duration) * 100;
      progress.style.width = `${progessWidth}%`;
      let musicCurrentTime = $(".current");
      let musicDurationTime = $(".duration");

      audio.addEventListener("loadeddata", () => {
        let audioDuration = audio.duration;
        let totalMin = Math.floor(audioDuration / 60);
        let totalSec = Math.floor(audioDuration % 60);
        if (totalSec < 10) {
          totalSec = `0${totalSec}`;
        }
        musicDurationTime.innerText = `${totalMin}:${totalSec}`;
        // Update currentTime
      });
      let currentMin = Math.floor(currentTime / 60);
      let currentSec = Math.floor(currentTime % 60);
      if (currentSec < 10) {
        currentSec = `0${currentSec}`;
      }
      musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
    });
    progressArea.addEventListener("click", (e) => {
      let progressWidthAfter = progressArea.clientWidth;
      let clickOffSetX = e.offsetX;
      let songDuration = audio.duration;
      audio.currentTime = (clickOffSetX / progressWidthAfter) * songDuration;
      audio.play();
    });

    // xu li khi bam nut next / pr
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.scrollActiveSong();
      _this.render();
    };
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.scrollActiveSong();
      _this.render();
    };
    // Xu li random bai hat
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //  xu li khi repeat bai hat
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };
    // xu li chuyen bai hat khi het bai
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // xu li lang nghe hanh vi click vao play list
    playList.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      // Xu li khi click vao song
      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  scrollActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex > this.song.length - 1) {
      app.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (app.currentIndex < 0) {
      app.currentIndex = app.song.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.song.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  start: function () {
    //Gan cau hinh tu config vao ung dung
    this.loadConfig();
    // dinh nghia cac thuoc tinh cho Object
    this.defineProperties();
    //  lang nghe cac su kien
    this.handleEvents();
    // phat bai hat tiep theo
    // Tai len ten va hinh nen bai hat
    this.loadCurrentSong();
    // render bai hat
    this.render();

    // hien thi trang thai ban dau cua buttom repeat va random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};
app.start();
