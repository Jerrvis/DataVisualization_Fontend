<script setup lang='ts'>
import Hot from '@/components/Hot.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Seller from '@/components/Seller.vue'
import Stock from '@/components/Stock.vue'
import Trend from '@/components/Trend.vue'
import { useThemeStore } from '@/store/theme'
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'
import { getThemeValue } from '@/utils/theme_util'

const fullScreenType = ref(-1)
const { proxy }: any = getCurrentInstance()
const chartMap = ['trend', 'seller', 'map', 'rank', 'hot', 'stock']
const theme = useThemeStore()

const updateTheme = (data: any) => {
  if (data.value == theme.state) return
  theme.change()
}

proxy.$socket.registerCallBack('themeChange', updateTheme)


const changeTheme = () => {
  theme.change()
  proxy.$socket.send({
    action: 'themeChange',
    socketType: 'themeChange',
    chartName: '',
    value: theme.state
  })
}

const themeSrc = computed(() => {
  return '/static/images/' + getThemeValue(theme.state).themeSrc
})

const headerSrc = computed(() => {
  return '/static/images/' + getThemeValue(theme.state).headerBorderSrc
})

const backgroundStyle = computed(() => {
  return { background: getThemeValue(theme.state).backgroundColor }
})

const titleStyle = computed(() => {
  return { color: getThemeValue(theme.state).titleColor }
})

const recvData = (data: any) => {

  if (data.value) {
    let chartNum = chartMap.indexOf(data.chartName)
    fullScreenType.value = chartNum
  } else {
    fullScreenType.value = -1
  }
  const myEvent = new Event('resize', {
    bubbles: true,
    cancelable: true
  });
  window.dispatchEvent(myEvent)
}

proxy.$socket.registerCallBack('fullScreen', recvData)

const changeFullScreen = (num: number) => {
  if (fullScreenType.value == num) {
    fullScreenType.value = -1
  } else {
    fullScreenType.value = num
  }
  // 手动窗口派发一个事件，触发组件的监听事件
  const myEvent = new Event('resize', {
    bubbles: true,
    cancelable: true
  });
  window.dispatchEvent(myEvent)
  proxy.$socket.send({
    action: 'fullScreen',
    socketType: 'fullScreen',
    chartName: chartMap[num],
    value: fullScreenType.value > -1 ? true : false
  })
}

onBeforeUnmount(() => {
  proxy.$socket.registerCallBack('themeChange')
  proxy.$socket.unRegisterCallBack('fullScreen')
})

</script>
<template>
  <div class="screen-container" :style="backgroundStyle">
    <header class="screen-header">
      <div>
        <img :src="headerSrc" alt="">
      </div>
      <span class="logo">
        <!-- <img :src="logoSrc" alt="" /> -->
      </span>
      <span class="title" :style="titleStyle">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="changeTheme">
        <span class="datetime">2049-01-01 00:00:00</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left ">
        <div id="left-top" :class="[fullScreenType == 0 ? 'fullscreen' : '']">
          <!-- 销量趋势图表 -->
          <Trend />
          <div class="resize">
            <span @click="changeFullScreen(0)"
              :class="['iconfont', fullScreenType == 0 ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom" :class="[fullScreenType == 1 ? 'fullscreen' : '']">
          <!-- 商家销售金额图表 -->
          <Seller />
          <div class="resize">
            <span @click="changeFullScreen(1)"
              :class="['iconfont', fullScreenType == 1 ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="[fullScreenType == 2 ? 'fullscreen' : '']">
          <!-- 商家分布图表 -->
          <Map />
          <div class="resize">
            <span @click="changeFullScreen(2)"
              :class="['iconfont', fullScreenType == 2 ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="middle-bottom" :class="[fullScreenType == 3 ? 'fullscreen' : '']">
          <!-- 地区销量排行图表 -->
          <Rank />
          <div class="resize">
            <span @click="changeFullScreen(3)"
              :class="['iconfont', fullScreenType == 3 ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="[fullScreenType == 4 ? 'fullscreen' : '']">
          <!-- 热销商品占比图表 -->
          <Hot />
          <div class="resize">
            <span @click="changeFullScreen(4)"
              :class="['iconfont', fullScreenType == 4 ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="right-bottom" :class="[fullScreenType == 5 ? 'fullscreen' : '']">
          <!-- 库存销量分析图表 -->
          <Stock />
          <div class="resize">
            <span @click="changeFullScreen(5)"
              :class="['iconfont', fullScreenType == 5 ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}

.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;

  >div {
    img {
      width: 100%;
    }
  }

  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }

  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }

  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }

  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }

  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);

    img {
      height: 35px;
      width: 128px;
    }
  }
}

.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;

  .screen-left {
    height: 100%;
    width: 27.6%;

    #left-top {
      height: 53%;
      position: relative;
    }

    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }

  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;

    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }

    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }

  .screen-right {
    height: 100%;
    width: 27.6%;

    #right-top {
      height: 46%;
      position: relative;
    }

    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}

.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
