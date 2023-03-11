<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, onBeforeUnmount, computed, reactive, watch } from 'vue';
import { ECharts, EChartsOption } from 'echarts'
import { useThemeStore } from '@/store/theme'
const theme = useThemeStore()
const unwatch = watch(() => theme.state, () => {
  chart.dispose()
  initChart()
  updateChartData()
  chartResize()
})

const chartRef = ref<HTMLElement | null>(null)
let chart: ECharts


let allData: any = ref({})

const selectTypes = ref<any>(null)
const showType = ref<any>({ text: '' })
const showChoice = ref<boolean>(false)
let nowType = 'map'
const size = ref(64)
const fontSize = computed(() => {
  return { fontSize: size.value + 'px' }
})

const marginSize = computed(() => {
  return { marginLeft: size.value / 1.6 + 'px' }
})

const setShow = () => {
  showChoice.value = !showChoice.value
}

// 更换 图表 type 
const clickType = (type: any) => {
  nowType = type.key
  showType.value = type
  updateChartData()
  setShow()
}

const { proxy }: any = getCurrentInstance()
// 初始化图表
const initChart = () => {
  if (chartRef.value !== null) {
    chart = proxy.$echarts.init(chartRef.value, theme.state)
    const option: EChartsOption = {
      grid: {
        left: '3%',
        top: '35%',
        right: '4%',
        bottom: '2%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        left: 20,
        top: '15%',
        icon: 'circle'
      }
    }
    chart.setOption(option)
  }

}

// 宽度适配
const chartResize = () => {
  /**
   * requestIdleCallback 空闲调度(异步)
   * 也可使用setTimeout
   * 浏览器执行顺序如下
   * 1.运行js 更改dom的class(dom 的宽高还是原来的值)
   * 2.计算dom 样式
   * 3.渲染(更改dom 的宽高)
   * 4.requestIdleCallback(空闲调度)
   * */
  requestIdleCallback(() => {
    if (chart && chartRef.value !== null) {
      const titleFontSize = chartRef.value.offsetWidth / 100 * 3.6
      size.value = titleFontSize
      const adapterOption: EChartsOption = {
        legend: {
          itemHeight: titleFontSize,
          itemWidth: titleFontSize,
          itemGap: titleFontSize
        },
        textStyle: {
          fontSize: titleFontSize
        }
      }
      chart.setOption(adapterOption)
      size.value = titleFontSize
      chart.resize()
    }
  })
}

// 获取数据
const getData = (data: any) => {

  // const res = await proxy.$http.get('trend')

  allData.value = data
  selectTypes.value = data.type
  // // 设置图表标题 展示类型
  showType.value = allData.value.type[0]

  updateChartData()
}


// 更新图表
const updateChartData = () => {
  // 半透明的颜色值
  const colorArr1 = [
    'rgba(11, 168, 44, 0.5)',
    'rgba(44, 110, 255, 0.5)',
    'rgba(22, 242, 217, 0.5)',
    'rgba(254, 33, 30, 0.5)',
    'rgba(250, 105, 0, 0.5)'
  ]
  // 全透明的颜色值
  const colorArr2 = [
    'rgba(11, 168, 44, 0)',
    'rgba(44, 110, 255, 0)',
    'rgba(22, 242, 217, 0)',
    'rgba(254, 33, 30, 0)',
    'rgba(250, 105, 0, 0)'
  ]
  // 类目轴数据
  const timeArr = allData.value.common.month
  // y轴数据
  const valueArr = allData.value[nowType].data

  const seriesArr = valueArr.map((item: any, index: number) => {
    return {
      type: 'line',
      data: item.data,
      stack: 'map',
      name: item.name,
      areaStyle: {
        color: new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: colorArr1[index]
          },
          {
            offset: 1,
            color: colorArr2[index]
          }
        ])
      }
    }
  })

  const legendArr = valueArr.map((item: any) => {
    return item.name
  })

  const dataOption: EChartsOption = {
    xAxis: {
      data: timeArr
    },
    legend: {
      data: legendArr
    },
    series: seriesArr,
  }
  chart.setOption(dataOption)
}

proxy.$socket.registerCallBack('trendData', getData)

onMounted(async () => {
  initChart()
  // await getData()
  proxy.$socket.send({
    action: 'getData',
    socketType: 'trendData',
    chartName: 'trend',
    value: ''
  })


  // 屏幕适配
  chartResize()
  window.addEventListener('resize', chartResize)
})

onBeforeUnmount(() => {
  unwatch()
  window.removeEventListener('resize', chartResize)
  proxy.$socket.unRegisterCallBack('trendData')
})



</script>
<template>
  <div class="com-container">
    <div class="title">
      <span class="title-t" :style="fontSize">{{ "▎" + showType.text }}</span>
      <span class="iconfont title-icon" :style="fontSize" @click="setShow">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginSize">
        <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="clickType(item)">
          <p :style="fontSize" v-show="item.key !== showType.key">{{ item.text }}</p>
        </div>

      </div>
    </div>
    <div class="com-chart" ref="chartRef"></div>
  </div>
</template>
<style lang="less" scoped>
.title {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 10;
  color: white;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }

  .select-item {
    cursor: pointer;
  }

  .select-con {
    background-color: #222733;
  }
}
</style>