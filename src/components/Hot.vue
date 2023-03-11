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
let allData: any = null
let size = ref(0)
let type = ref(0)
const selectName = ref('')

const { proxy }: any = getCurrentInstance()

const clickArrow = (num: number) => {
  type.value += num
  if (type.value >= allData.length) type.value = 0;
  if (type.value < 0) type.value = allData.length - 1
  updateChartData()

}

const titleStyle = computed(() => {
  return {
    fontSize: size.value + 'px'
  }
})

// 初始化图表
const initChart = () => {
  if (chartRef.value !== null) {
    chart = proxy.$echarts.init(chartRef.value, theme.state)
    const option: EChartsOption = {
      title: {
        text: '▎热销商品的占比',
        left: 20,
        top: 20,
      },
      series: [
        {
          type: 'pie',
          label: {
            show: false,

          },
          emphasis: {
            label: {
              show: true
            },
            labelLine: {
              show: false
            }
          }
        }
      ],
      legend: {
        top: '10%',
        icon: 'circle'
      },
      tooltip: {
        show: true,
        formatter: (args: any) => {
          const category = args.data.children
          let total = 0
          category.forEach((e: any) => {
            total += e.value
          })
          let resStr = ''
          category.map((item: any) => {
            resStr += ` 
            ${item.name}:${(item.value / total * 100).toFixed(1) + '%'}
            <br />
            `
          })
          return resStr
        }
      }
    }
    chart.setOption(option)
  }

}

// 宽度适配
const chartResize = () => {
  requestIdleCallback(() => {
    if (chart && chartRef.value !== null) {
      const titleFontSize = chartRef.value.offsetWidth / 100 * 3.6
      size.value = titleFontSize
      const adapterOption: EChartsOption = {
        title: {
          textStyle: {
            fontSize: size.value
          }
        },
        legend: {
          itemWidth: size.value / 2,
          itemHeight: size.value / 2,
          itemGap: size.value / 2,
          textStyle: {
            fontSize: size.value / 2
          }
        },
        series: [
          {
            radius: size.value * 4.5,
            center: ['50%', '50%']
          }
        ]
      }
      chart.setOption(adapterOption)
      chart.resize()
    }
  })
}

// 获取数据
const getData = (data: any) => {
  // const res = await proxy.$http.get('hotproduct')
  allData = data
  updateChartData()
}
// 更新图表
const updateChartData = () => {
  const seriesData = allData[type.value].children.map((item: any) => {

    return {
      name: item.name,
      value: item.value,
      children: item.children
    }
  })
  const legendData = allData[type.value].children.map((item: any) => {
    return item.name
  })
  const dataOption: EChartsOption = {
    legend: {
      data: legendData
    },
    series: [
      {
        data: seriesData
      }
    ]
  }
  selectName.value = allData[type.value].name
  chart.setOption(dataOption)
}

proxy.$socket.registerCallBack('hotData', getData)

onMounted(async () => {
  initChart()
  // await getData()
  // updateChartData()
  proxy.$socket.send({
    action: 'getData',
    socketType: 'hotData',
    chartName: 'hotproduct',
    value: ''
  })
  // 屏幕适配
  chartResize()
  window.addEventListener('resize', chartResize)
})

onBeforeUnmount(() => {
  unwatch()
  window.removeEventListener('resize', chartResize)
  proxy.$socket.unRegisterCallBack('hotData')

})
</script>
<template>
  <div class="com-container">
    <div class="com-chart" ref="chartRef"></div>
    <span class="iconfont arr-left" :style="titleStyle" @click="clickArrow(-1)">&#xe6ef;</span>
    <span class="iconfont arr-right" :style="titleStyle" @click="clickArrow(1)">&#xe6ed;</span>
    <span class="title" :style="titleStyle">{{ selectName }}</span>
  </div>
</template>
<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}

.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}

.title {
  position: absolute;
  left: 80%;
  bottom: 2%;
  color: white;
}
</style>