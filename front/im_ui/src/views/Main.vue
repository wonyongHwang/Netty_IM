<template>
  <div class="main container">
    <router-view />
    <van-tabbar v-model="active" >
      <van-tabbar-item icon="friends-o" to="/Main/Friends">Friend</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/Main/Omok">Omok</van-tabbar-item>
      <van-tabbar-item icon="add-o" to="/Main/Room">Online</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { Tabbar, TabbarItem } from "vant";
export default {
  name: "Main",
  props: {},
  data() {
    return {
      active: 0
    };
  },
  created(){
    // const scripts = [
    //  "/omoklogic.js",
    // ];
    // scripts.forEach(script => {
    //   let tag = document.head.querySelector(`[src="${script}"`);
    //       if (!tag) {
    //    tag = document.createElement("script");
    //     tag.setAttribute("src", script);
    //    tag.setAttribute("type", 'text/javascript');
    //     document.head.appendChild(tag);
    //       }
    // });
    
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
