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
let start = 0
let end = 5
let timer: NodeJS.Timer | number = 0


const { proxy }: any = getCurrentInstance()

// 初始化图表
const initChart = () => {
  if (chartRef.value !== null) {
    chart = proxy.$echarts.init(chartRef.value, theme.state)
    const option: EChartsOption = {
      title: {
        text: '▎库存和销量分析',
        left: 20,
        top: 20
      }
    }
    chart.setOption(option)
    chart.on('mouseover', () => {
      clearInterval(timer)
    })
    chart.on('mouseout', () => {
      startInterval()
    })
  }

}

// 宽度适配
const chartResize = () => {
  requestIdleCallback(() => {
    if (chart && chartRef.value !== null) {
      const titleFontSize = chartRef.value.offsetWidth / 100 * 3.6
      const innerRadius = titleFontSize * 2
      const outerRadius = innerRadius * 1.125

      size.value = titleFontSize
      const adapterOption: EChartsOption = {
        title: {
          textStyle: {
            fontSize: size.value
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
          },
          {
            type: 'pie',
            radius: [outerRadius, innerRadius],
            label: {
              fontSize: titleFontSize / 2
            }
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

  allData = data
  updateChartData()
}
// 更新图表
const updateChartData = () => {
  const centerArr = [
    ['18%', '40%'],
    ['50%', '40%'],
    ['82%', '40%'],
    ['34%', '75%'],
    ['66%', '75%']
  ]
  const colorArr = [
    ['#4FF778', '#0BA82C'],
    ['#E5DD45', '#E8B11C'],
    ['#E8821C', '#E55445'],
    ['#5052EE', '#AB6EE5'],
    ['#23E5E5', '#2E72BF']
  ]
  const showData = allData.slice(start, end)
  const seriesData = showData.map((item: any, index: number) => {
    return {
      type: 'pie',
      center: centerArr[index],
      hoverAnimation: false,
      labelLine: {
        show: false
      },
      label: {
        position: 'center',
        color: colorArr[0],
        show: true
      },
      data: [
        {
          name: item.name + '\n\n' + item.sales,
          value: item.sales,
          itemStyle: {
            color: new proxy.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: colorArr[index][0]
              },
              {
                offset: 1,
                color: colorArr[index][1]
              }
            ])
          }
        },
        {
          value: item.stock,
          itemStyle: {
            color: '#333843'
          }
        }
      ]
    }
  })
  const dataOption: EChartsOption = {
    series: seriesData
  }

  chart.setOption(dataOption)
}

const startInterval = () => {
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    if (start + 5 > allData.length) {
      start = 0
      end = 5
    } else {
      start += 5
      end += 5
    }
    updateChartData()
  }, 5000)
}

proxy.$socket.registerCallBack('stockData', getData)


onMounted(async () => {
  initChart()
  // await getData()
  proxy.$socket.send({
    action: 'getData',
    socketType: 'stockData',
    chartName: 'stock',
    value: ''
  })

  // 屏幕适配
  chartResize()
  startInterval()
  window.addEventListener('resize', chartResize)
})

onBeforeUnmount(() => {
  unwatch()
  clearInterval(timer)
  window.removeEventListener('resize', chartResize)
  proxy.$socket.unRegisterCallBack('stockData')
})

</script>
<template>
  <div class="com-container">
    <div class="com-chart" ref="chartRef"></div>
  </div>
</template>
<style lang="less" scoped></style>