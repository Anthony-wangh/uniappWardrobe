<template>
  <view>
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 页面标题 -->
    <view class="header">
      <text class="header-title">添加衣物</text>
    </view>

    <view class="add-clothes-container">
      <!-- 图片选择区域 -->
      <view class="image-picker" @click="chooseImage">
        <image v-if="form.image" :src="form.image" class="selected-image" />
        <text v-else class="upload-text">点击选择图片</text>
      </view>

      <!-- 名称输入 -->
      <view class="form-group">
        <label>名称</label>
        <input class="input-field" v-model="form.name" placeholder="请输入衣服名称（必填）" />
      </view>

      <!-- 类目选择 -->
    <!--  <view class="form-group">
        <label>分类</label>
        <view class="category-selector">
          <scroll-view class="left-menu" scroll-y>
            <view
              v-for="(item, index) in primaryCategories"
              :key="index"
              :class="['menu-item', { active: currentPrimaryIndex === index }]"
              @click="selectPrimaryCategory(index)"
            >
              {{ item }}
            </view>
          </scroll-view>
          <scroll-view class="right-menu" scroll-y>
            <view
              v-for="(item, index) in secondaryCategories[currentPrimaryCategory]"
              :key="index"
              class="sub-item"
              @click="selectSecondaryCategory(item)"
            >
              {{ item }}
            </view>
          </scroll-view>
        </view>
      </view> -->
	  
	  <view class="form-group">
	    <label>类目</label>
	    <view class="picker" @click="showCategoryPicker = true">
	      <text class="picker-text">
	        {{ form.primaryCategory && form.secondaryCategory ? form.primaryCategory + ' / ' + form.secondaryCategory : '请选择类目（必选）' }}
	      </text>
	    </view>
	  </view>

      <!-- 其他表单项 -->
      <view class="form-group">
        <label>购买时间</label>
        <picker mode="date" @change="selectPurchaseDate" class="picker">
          <view class="picker-text">{{ form.purchaseDate || "请选择购买时间" }}</view>
        </picker>
      </view>

      <view class="form-group">
        <label>价值</label>
        <input class="input-field" v-model="form.value" type="digit" placeholder="请输入价值（可选）" />
      </view>

      <view class="form-group">
        <label>品牌</label>
        <input class="input-field" v-model="form.brand" placeholder="请输入品牌（可选）" />
      </view>

      <view class="form-group">
        <label>备注</label>
        <textarea class="textarea-field" v-model="form.notes" placeholder="请输入备注（可选）"></textarea>
      </view>

      <button class="submit-btn" @click="submitForm">保存</button>
      <text class="error-msg" v-if="errorMsg">{{ errorMsg }}</text>
    </view>
  </view>
  
  <u-picker
    :show="showCategoryPicker"
    :columns="categoryColumns"
    keyName="label"
    @confirm="onCategoryConfirm"
    @cancel="showCategoryPicker = false"
  />
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      form: {
        id: '',
        image: '',
        name: '',
        primaryCategory: '',
        secondaryCategory: '',
        value: '',
        notes: '',
        purchaseDate: '',
        brand: ''
      },
      categories: {
            上衣: ["T恤", "衬衫", "外套", "羽绒服"],
            裤子: ["牛仔裤", "运动裤", "休闲裤", "裙子"],
            鞋: ["运动鞋", "高跟鞋", "靴子", "皮鞋", "休闲鞋", "拖鞋"],
            配饰: ["帽子", "眼镜", "丝巾"],
            包: ["单肩包", "双肩包"]
          },
      currentPrimaryIndex: 0,
      currentPrimaryCategory: '上衣',
      errorMsg: '',
      isEdit: false,
	  showCategoryPicker: false,
    };
  },
  onLoad() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
  },
  computed: {
    categoryColumns() {
      const primary = Object.keys(this.categories);
      const secondaries = this.form.primaryCategory
        ? this.categories[this.form.primaryCategory]
        : this.categories[primary[0]];
      return [
        primary.map(i => ({ label: i })),
        secondaries.map(i => ({ label: i }))
      ];
    }
  },
  methods: {
	  onCategoryConfirm(e) {
	      const [primary, secondary] = e.value;
	      this.form.primaryCategory = primary.label;
	      this.form.secondaryCategory = secondary.label;
	      this.showCategoryPicker = false;
	    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: res => {
          this.form.image = res.tempFilePaths[0];
        }
      });
    },
    selectPrimaryCategory(index) {
      this.currentPrimaryIndex = index;
      this.currentPrimaryCategory = this.primaryCategories[index];
      this.form.primaryCategory = this.primaryCategories[index];
      this.form.secondaryCategory = '';
    },
    selectSecondaryCategory(item) {
      this.form.secondaryCategory = item;
    },
    selectPurchaseDate(e) {
      this.form.purchaseDate = e.detail.value;
    },
    generateUniqueId() {
      return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    submitForm() {
      if (!this.form.image) return (this.errorMsg = '请上传衣服图片');
      if (!this.form.name) return (this.errorMsg = '请输入衣服名称');
      if (!this.form.primaryCategory) return (this.errorMsg = '请选择一级类目');
      if (!this.form.secondaryCategory) return (this.errorMsg = '请选择二级类目');

      let clothes = uni.getStorageSync('clothes') || [];

      if (this.isEdit) {
        let index = clothes.findIndex(item => item.id === this.form.id);
        if (index !== -1) clothes[index] = this.form;
        else {
          this.form.id = this.generateUniqueId();
          clothes.push(this.form);
        }
      } else {
        this.form.id = this.generateUniqueId();
        clothes.push(this.form);
      }

      uni.setStorageSync('clothes', clothes);
      uni.showToast({ title: this.isEdit ? '修改成功' : '上传成功', icon: 'success' });

      this.resetForm();
      setTimeout(() => uni.navigateBack(), 100);
    },
    resetForm() {
      this.form = {
        image: '',
        name: '',
        primaryCategory: '',
        secondaryCategory: '',
        value: '',
        notes: '',
        purchaseDate: '',
        brand: ''
      };
      this.errorMsg = '';
    }
  }
};
</script>

<style lang="scss">
.status-bar {
  width: 100%;
  background-color: #ffffff;
}
.header {
  width: 100%;
  height: 44px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}
.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.add-clothes-container {
  width: 100%;
  padding: 20px 30px;
  box-sizing: border-box;
  background-color: #f5f5f5;
}
.image-picker {
  width: 100%;
  height: 180px;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 20px;
  cursor: pointer;
}
.selected-image {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
}
.upload-text {
  color: #666;
  font-size: 16px;
}
.form-group {
  margin-bottom: 20px;
  label {
    display: block;
    font-size: 15px;
    font-weight: bold;
    color: #666;
    margin-bottom: 5px;
  }
  .input-field,
  .picker {
    width: 100%;
    height: 45px;
    padding: 0 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #ffffff;
    font-size: 14px;
    color: #333;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  .textarea-field {
    width: 100%;
    height: 80px;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #ffffff;
    font-size: 14px;
    color: #333;
    resize: none;
    box-sizing: border-box;
  }
}
.category-selector {
  display: flex;
  height: 180px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}
.left-menu {
  width: 30%;
  background-color: #f7f7f7;
}
.right-menu {
  width: 70%;
  background-color: #ffffff;
}
.menu-item {
  padding: 15px;
  text-align: center;
  font-size: 14px;
}
.menu-item.active {
  background-color: #e6f0ff;
  font-weight: bold;
  color: #007aff;
}
.sub-item {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.submit-btn {
  width: 100%;
  background-color: #d0e183;
  color: #fff;
  font-size: 16px;
  text-align: center;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 10px 0;
  &:active {
    background-color: #bac875;
  }
}
.error-msg {
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}
</style>
