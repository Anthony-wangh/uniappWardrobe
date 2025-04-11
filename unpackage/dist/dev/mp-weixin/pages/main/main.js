"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const PrivacyCheck = () => "../../components/PrivacyCheck.js";
const _sfc_main = {
  components: {
    PrivacyCheck
  },
  data() {
    return {
      nickName: "帅哥",
      usingDate: 99,
      weatherDetail: "",
      weatherTips: "",
      weatherInfo: {},
      clothingAdvice: {}
    };
  },
  onShow() {
    this.getWeather();
  },
  methods: {
    isToday(dateStr) {
      const [y, m, d] = dateStr.split("-").map(Number);
      const target = new Date(y, m - 1, d);
      const today = /* @__PURE__ */ new Date();
      return target.getFullYear() === today.getFullYear() && target.getMonth() === today.getMonth() && target.getDate() === today.getDate();
    },
    async getWeather() {
      const weather = common_vendor.index.getStorageSync("weatherInfo");
      if (weather) {
        if (this.isToday(weather.fxDate)) {
          this.weatherInfo = weather;
          this.updateWeather(weather);
          return;
        }
      }
      common_vendor.index.getLocation({
        type: "wgs84",
        success: (res) => {
          const latitude = res.latitude;
          const longitude = res.longitude;
          const location = `${longitude},${latitude}`;
          common_vendor.wx$1.request({
            url: "https://nd3tefcedt.re.qweatherapi.com/v7/weather/3d",
            data: {
              location,
              key: "38c34a465f6f4afa9e15de9954fc542c"
            },
            success: (res2) => {
              const data = res2.data.daily[0];
              common_vendor.index.setStorageSync("weatherInfo", data);
              this.weatherInfo = data;
              this.updateWeather(data);
              common_vendor.index.__f__("log", "at pages/main/main.vue:100", data);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/main/main.vue:103", "获取天气失败:", err);
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/main/main.vue:108", "获取位置信息失败", err);
        }
      });
    },
    updateWeather(weather) {
      const tempreture = weather.textDay + "  " + weather.tempMin + "℃ ~ " + weather.tempMax + "℃";
      const wind = `${weather.windDirDay}  ${weather.windScaleDay}级  紫外线等级: ${weather.uvIndex}`;
      this.weatherDetail = `${tempreture}
${wind}`;
      this.clothingAdvice = this.getClothingAdvice(weather);
      this.weatherTips = this.clothingAdvice.summary;
    },
    clickWardrobe() {
      common_vendor.index.navigateTo({
        url: "/pages/wardrobe/wardrobe"
      });
    },
    clickSuit() {
      common_vendor.index.navigateTo({
        url: "/pages/matching/matching"
      });
    },
    // 在Vue组件的methods中添加以下方法
    getClothingAdvice(weatherData) {
      const tempMax = parseInt(weatherData.tempMax) || 0;
      const tempMin = parseInt(weatherData.tempMin) || 0;
      const avgTemp = (tempMax + tempMin) / 2;
      const tempDiff = tempMax - tempMin;
      const tempLevel = [
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
      ].find((l) => avgTemp <= l.max);
      let recommendation = {
        level: tempLevel.name,
        upper: [],
        lower: [],
        accessories: [],
        tips: [],
        specialNotes: []
      };
      switch (tempLevel.level) {
        case "extremeCold":
          recommendation.upper = ["加厚羽绒服", "防风冲锋衣", "高领羊毛衫", "保暖内衣"];
          recommendation.lower = ["加绒加厚棉裤", "保暖秋裤", "羊毛裤"];
          recommendation.accessories = ["毛线帽", "围巾", "加厚手套", "雪地靴"];
          recommendation.tips.push("避免皮肤直接暴露在空气中");
          break;
        case "severeCold":
          recommendation.upper = ["长款羽绒服", "毛衣+大衣", "抓绒内搭"];
          recommendation.lower = ["加厚毛呢裤", "保暖打底裤"];
          recommendation.accessories = ["针织帽", "围巾", "保暖手套"];
          break;
        case "cold":
          recommendation.upper = ["短款羽绒服", "羊毛大衣", "厚卫衣"];
          recommendation.lower = ["加绒牛仔裤", "灯芯绒裤子"];
          recommendation.accessories = ["薄围巾", "耳罩"];
          recommendation.tips.push("注意手脚保暖");
          break;
        case "chilly":
          recommendation.upper = ["风衣", "针织开衫", "薄毛衣"];
          recommendation.lower = ["普通牛仔裤", "休闲裤"];
          recommendation.accessories = ["薄外套备用"];
          break;
        case "cool":
          recommendation.upper = ["长袖衬衫", "卫衣", "薄外套"];
          recommendation.lower = ["卡其裤", "薄款牛仔裤"];
          recommendation.accessories = ["丝巾装饰"];
          recommendation.tips.push("适合叠穿搭配");
          break;
        case "comfortable":
          recommendation.upper = ["短袖T恤", "POLO衫", "薄衬衫"];
          recommendation.lower = ["九分裤", "短裙+打底袜"];
          recommendation.accessories = ["防晒衣备用"];
          break;
        case "warm":
          recommendation.upper = ["透气短袖", "背心", "雪纺上衣"];
          recommendation.lower = ["短裤", "薄款连衣裙"];
          recommendation.accessories = ["遮阳帽", "太阳镜"];
          recommendation.tips.push("选择透气速干面料");
          break;
        case "hot":
          recommendation.upper = ["吊带衫", "无袖上衣", "真丝衬衫"];
          recommendation.lower = ["超短裤", "凉感面料裙装"];
          recommendation.accessories = ["UV防晒伞", "冰袖"];
          recommendation.tips.push("尽量避免正午外出");
          break;
      }
      this.applyWeatherEffects(recommendation, weatherData);
      if (tempDiff > 8) {
        recommendation.specialNotes.push(`昼夜温差大（${tempDiff}℃），建议采用洋葱式穿衣法`);
        recommendation.accessories.push("便携外套");
      }
      return {
        ...recommendation,
        summary: this.generateAdviceSummary(recommendation, weatherData)
      };
    },
    // 天气影响处理
    applyWeatherEffects(recommendation, weather) {
      if (weather.textDay.includes("雨")) {
        recommendation.accessories.push("雨伞");
        recommendation.upper.unshift("防水外套");
        if (parseInt(weather.windScaleDay) > 3) {
          recommendation.specialNotes.push("风雨较大，建议穿防滑鞋");
        }
      }
      if (parseInt(weather.windScaleDay) >= 4) {
        recommendation.upper = recommendation.upper.map(
          (item) => item.includes("外套") ? `防风${item}` : item
        );
        recommendation.accessories.push("防风眼镜");
      }
      if (weather.textDay.includes("晴")) {
        recommendation.accessories.push("防晒霜");
        if (parseInt(weather.tempMax) > 25) {
          recommendation.tips.push("建议选择浅色系衣物");
        }
      }
    },
    // 生成自然语言建议
    generateAdviceSummary(recommendation, weather) {
      const parts = [];
      `${weather.tempMin}~${weather.tempMax}℃`;
      if (recommendation.upper.length) {
        parts.push(`- 上衣：${recommendation.upper.join(" / ")}`);
      }
      if (recommendation.lower.length) {
        parts.push(`- 下装：${recommendation.lower.join(" / ")}`);
      }
      if (recommendation.accessories.length) {
        parts.push(`-️ 配饰：${recommendation.accessories.join("、")}`);
      }
      if (recommendation.specialNotes.length) {
        parts.push(`- 注意：${recommendation.specialNotes.join("；")}`);
      }
      if (recommendation.tips.length) {
        parts.push(`- 小贴士：${recommendation.tips.join("；")}`);
      }
      return `天气${recommendation.level}
${parts.join("\n")}`;
    }
  }
};
if (!Array) {
  const _component_PrivacyCheck = common_vendor.resolveComponent("PrivacyCheck");
  _component_PrivacyCheck();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.nickName),
    b: common_vendor.t($data.usingDate),
    c: common_assets._imports_0,
    d: common_vendor.o((...args) => $options.clickWardrobe && $options.clickWardrobe(...args)),
    e: common_assets._imports_1,
    f: common_vendor.o((...args) => $options.clickSuit && $options.clickSuit(...args)),
    g: common_vendor.t($data.weatherDetail),
    h: common_vendor.t($data.weatherTips)
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4f50ca8f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/main/main.js.map
