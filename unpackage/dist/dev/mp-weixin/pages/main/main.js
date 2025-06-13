"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      weatherInfo: {},
      clothingAdvice: {
        upper: [],
        lower: [],
        accessories: [],
        tips: [],
        specialNotes: [],
        summary: ""
      },
      weatherDetail: "",
      weatherTips: "",
      windText: "",
      weatherIcon: "",
      banners: [
        "/static/banners/banner1.png",
        "/static/banners/banner2.png",
        "/static/banners/banner3.png"
      ],
      userInfo: {},
      isLoggedIn: false,
      slogan: "让穿搭变得简单",
      weatherIcon: "/static/weather_icons/theme.png",
      currentDate: "",
      weekDay: "",
      recentlyClothes: []
    };
  },
  onShow() {
    this.userInfo = common_vendor.index.getStorageSync("wardrobeUserInfo") || {};
    const clothes = common_vendor.index.getStorageSync("clothes") || [];
    if (clothes.length > 0) {
      this.recentlyClothes = clothes.length > 5 ? clothes.slice(-5) : clothes;
    }
    this.getTime();
    this.getWeather();
  },
  methods: {
    getTime() {
      const date = /* @__PURE__ */ new Date();
      this.currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      const days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      this.weekDay = days[date.getDay()];
    },
    upload() {
      common_vendor.index.navigateTo({
        url: "/pages/addClothes/addClothes"
      });
    },
    startMatch() {
      common_vendor.index.switchTab({
        url: "/pages/matching/matching"
      });
    },
    isToday(dateStr) {
      const [y, m, d] = dateStr.split("-").map(Number);
      const target = new Date(y, m - 1, d);
      const today = /* @__PURE__ */ new Date();
      return target.getFullYear() === today.getFullYear() && target.getMonth() === today.getMonth() && target.getDate() === today.getDate();
    },
    refreshWeather() {
      this.getWeather();
    },
    async getWeather() {
      const cache = common_vendor.index.getStorageSync("weatherInfo");
      if (cache && this.isToday(cache.fxDate)) {
        this.weatherInfo = cache;
        this.updateWeather(cache);
        return;
      }
      common_vendor.index.getLocation({
        type: "wgs84",
        success: (res) => {
          const loc = `${res.longitude},${res.latitude}`;
          common_vendor.index.request({
            url: "https://nd3tefcedt.re.qweatherapi.com/v7/weather/3d",
            data: {
              location: loc,
              key: "38c34a465f6f4afa9e15de9954fc542c"
            },
            success: ({
              data
            }) => {
              const today = data.daily[0];
              common_vendor.index.setStorageSync("weatherInfo", today);
              this.weatherInfo = today;
              this.updateWeather(today);
            },
            fail: (err) => common_vendor.index.__f__("error", "at pages/main/main.vue:160", "获取天气失败:", err)
          });
        },
        fail: (err) => common_vendor.index.__f__("error", "at pages/main/main.vue:163", "获取位置失败:", err)
      });
    },
    updateWeather(w) {
      const tempText = `${w.tempMin}℃ ~ ${w.tempMax}℃`;
      this.windText = `${w.windDirDay} ${w.windScaleDay}级  紫外线: ${w.uvIndex}`;
      this.weatherDetail = `${tempText} ${w.textDay}`;
      this.weatherIcon = `/static/weather_icons/${w.textDay}.png`;
      this.clothingAdvice = this.getClothingAdvice(w);
      this.weatherTips = `${this.clothingAdvice.summary}`;
    },
    getClothingAdvice(weatherData) {
      const tMax = parseInt(weatherData.tempMax), tMin = parseInt(weatherData.tempMin), avg = (tMax + tMin) / 2, diff = tMax - tMin;
      const levelMap = [
        {
          max: -10,
          level: "extremeCold",
          name: "极寒"
        },
        {
          max: 0,
          level: "severeCold",
          name: "严寒"
        },
        {
          max: 10,
          level: "cold",
          name: "寒冷"
        },
        {
          max: 16,
          level: "chilly",
          name: "微寒"
        },
        {
          max: 22,
          level: "cool",
          name: "凉爽"
        },
        {
          max: 28,
          level: "comfortable",
          name: "舒适"
        },
        {
          max: 32,
          level: "warm",
          name: "炎热"
        },
        {
          max: Infinity,
          level: "hot",
          name: "酷热"
        }
      ];
      const lvl = levelMap.find((l) => avg <= l.max);
      const rec = {
        level: lvl.name,
        upper: [],
        lower: [],
        accessories: [],
        tips: [],
        specialNotes: []
      };
      switch (lvl.level) {
        case "extremeCold":
          rec.upper = ["加厚羽绒服", "高领羊毛衫"];
          rec.lower = ["加绒棉裤"];
          rec.accessories = ["毛线帽", "围巾"];
          rec.tips.push("注意保暖");
          break;
        case "severeCold":
          rec.upper = ["长款羽绒服", "毛衣+大衣"];
          rec.lower = ["保暖打底裤"];
          rec.accessories = ["针织帽"];
          break;
        case "cold":
          rec.upper = ["短款羽绒服", "厚卫衣"];
          rec.lower = ["加绒牛仔裤"];
          rec.accessories = ["薄围巾"];
          break;
        case "chilly":
          rec.upper = ["风衣", "薄毛衣"];
          rec.lower = ["休闲裤"];
          rec.accessories = ["便携外套"];
          break;
        case "cool":
          rec.upper = ["长袖衬衫", "薄外套"];
          rec.lower = ["薄款牛仔裤"];
          rec.accessories = ["丝巾"];
          rec.tips.push("适合叠穿");
          break;
        case "comfortable":
          rec.upper = ["短袖T恤", "POLO衫"];
          rec.lower = ["九分裤"];
          rec.accessories = ["防晒衣"];
          break;
        case "warm":
          rec.upper = ["透气短袖", "雪纺上衣"];
          rec.lower = ["短裤"];
          rec.accessories = ["遮阳帽"];
          rec.tips.push("选透气面料");
          break;
        case "hot":
          rec.upper = ["无袖上衣", "真丝衬衫"];
          rec.lower = ["凉感裙装"];
          rec.accessories = ["防晒伞"];
          rec.tips.push("避免正午外出");
          break;
      }
      if (weatherData.textDay.includes("雨")) {
        rec.accessories.push("雨伞");
        if (parseInt(weatherData.windScaleDay) > 3)
          rec.specialNotes.push("风雨较大，穿防滑鞋");
      }
      if (parseInt(weatherData.windScaleDay) >= 4) {
        rec.specialNotes.push("注意防风");
      }
      if (diff > 8) {
        rec.specialNotes.push(`昼夜温差${diff}℃，建议洋葱式穿搭`);
      }
      const parts = [];
      if (rec.upper.length)
        parts.push(`- 上衣：${rec.upper.join(" / ")}`);
      if (rec.lower.length)
        parts.push(`- 下装：${rec.lower.join(" / ")}`);
      if (rec.accessories.length)
        parts.push(`- 配饰：${rec.accessories.join("、")}`);
      if (rec.specialNotes.length)
        parts.push(`- 注意：${rec.specialNotes.join("；")}`);
      if (rec.tips.length)
        parts.push(`- 小贴士：${rec.tips.join("；")}`);
      rec.summary = `天气${rec.level}
${parts.join("\n")}`;
      return rec;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.userInfo.avatarUrl,
    b: common_vendor.t($data.userInfo.nickName),
    c: common_vendor.t($data.weatherDetail),
    d: common_vendor.t($data.windText),
    e: common_vendor.t($data.weatherTips),
    f: common_vendor.t($data.currentDate),
    g: common_vendor.t($data.weekDay),
    h: common_assets._imports_0$1,
    i: common_vendor.o((...args) => $options.upload && $options.upload(...args)),
    j: common_assets._imports_1$1,
    k: common_vendor.o((...args) => $options.startMatch && $options.startMatch(...args)),
    l: $data.recentlyClothes.length === 0
  }, $data.recentlyClothes.length === 0 ? {} : {
    m: common_vendor.f($data.recentlyClothes, (item, index, i0) => {
      return {
        a: item.image,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.primaryCategory),
        d: common_vendor.t(item.secondaryCategory),
        e: index
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4f50ca8f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/main/main.js.map
