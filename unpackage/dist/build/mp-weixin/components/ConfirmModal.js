"use strict";const e=require("../common/vendor.js"),t={name:"ConfirmModal",props:{visible:{type:Boolean,default:!1},title:{type:String,default:"确认删除？"},message:{type:String,default:"删除后，该类目下的衣物不会被删除。"},cancelText:{type:String,default:"取消"},confirmText:{type:String,default:"删除"}},methods:{onCancel(){this.$emit("cancel")},onConfirm(){this.$emit("confirm")}}};const n=e._export_sfc(t,[["render",function(t,n,o,i,r,c){return e.e({a:o.visible},o.visible?{b:e.t(o.title),c:e.t(o.message),d:e.t(o.cancelText),e:e.o(((...e)=>c.onCancel&&c.onCancel(...e))),f:e.t(o.confirmText),g:e.o(((...e)=>c.onConfirm&&c.onConfirm(...e)))}:{})}],["__scopeId","data-v-643fd541"]]);wx.createComponent(n);
