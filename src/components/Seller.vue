<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, onBeforeUnmount, watch } from 'vue';
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
const currentPage = ref<number>(1)
const totalPage = ref<number>(1)
const allData = ref<any[] | null>(null)
let timer: NodeJS.Timer | number = 0

const { proxy }: any = getCurrentInstance()

// 初始化图表
const initChart = () => {
  if (chartRef.value !== null) {
    chart = proxy.$echarts.init(chartRef.value, theme.state)
    const option: EChartsOption = {
      title: {
        text: '▎商家销售统计',
        textStyle: {
          fontSize: 64,
        },
        left: 20,
        top: 20
      },
      grid: {
        top: '20%',
        left: '3%',
        right: '6%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category'
      },
      series: [
        {
          type: 'bar',
          barWidth: 64,
          label: {
            show: true,
            position: 'right',
            color: 'white'
          },
          itemStyle: {

            borderRadius: [0, 33, 33, 0],
            color: new proxy.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: '#5052ee'
              },
              {
                offset: 1,
                color: '#ab6ee5'
              }
            ])
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          z: 0,
          lineStyle: {
            type: 'solid',
            width: 64,
            color: '#2d3443'
          }
        }
      }

    }
    chart.setOption(option)
    // 鼠标事件监听
    chart.on('mouseover', () => {
      clearInterval(timer)
    })
    chart.on('mouseout', () => {
      startInterval()
    })
  }

}

const chartResize = () => {

  requestIdleCallback(() => {
    if (chart && chartRef.value !== null) {
      const titleFontSize = chartRef.value.offsetWidth / 100 * 3.6
      const adapterOption: EChartsOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
            }
          }
        ],
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        }
      }
      chart.setOption(adapterOption)
      chart.resize()
    }
  })
}

// 获取数据
const getData = (data: any) => {
  const dataSort = data.sort((a: any, b: any) => a.value - b.value)
  totalPage.value = dataSort.length % 5 === 0 ? dataSort.length / 5 : dataSort.length / 5 + 1
  allData.value = dataSort
  currentPage.value = 1


  updateChartData()
}
// 更新图表
const updateChartData = () => {
  if (allData.value === null) return

  const start = (currentPage.value - 1) * 5
  const end = start + 5
  const showData = allData.value.slice(start, end)

  const sellerName = showData.map(item => item.name)
  const sellerValue = showData.map(item => item.value)
  const option: EChartsOption = {

    yAxis: {
      data: sellerName
    },
    series: [
      {

        data: sellerValue,
      }
    ]

  }
  chart.setOption(option)
}

const startInterval = () => {
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    if (currentPage.value < totalPage.value) {
      currentPage.value += 1
    } else {
      currentPage.value = 1
    }
    updateChartData()
  }, 2000)
}

proxy.$socket.registerCallBack('sellerData', getData)

onMounted(async () => {
  initChart()
  // await getData()
  proxy.$socket.send({
    action: 'getData',
    socketType: 'sellerData',
    chartName: 'seller',
    value: ''
  })
  // 启动定时器
  startInterval()
  // 屏幕适配
  chartResize()
  window.addEventListener('resize', chartResize)
})

onBeforeUnmount(() => {
  unwatch()
  // 关闭定时器
  clearInterval(timer)
  window.removeEventListener('resize', chartResize)
  proxy.$socket.unRegisterCallBack('sellerData')
})


</script>
<template>
  <div class="com-container">
    <div class="com-chart" ref="chartRef"></div>
  </div>
</template>
<style lang="less" scoped></style>