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
let allData: any[]
let showData: any = ref({})
let timer: NodeJS.Timer | number = 0

const { proxy }: any = getCurrentInstance()

let start = 0
let end = 9

// 初始化图表
const initChart = () => {
  if (chartRef.value !== null) {
    chart = proxy.$echarts.init(chartRef.value, theme.state)
    const option: EChartsOption = {
      title: {
        text: '▎地区销售排行',
        left: 20,
        top: 20,
        textStyle: {
          fontSize: 64
        }
      },
      grid: {
        top: '40%',
        left: '5%',
        right: '5%',
        bottom: '5%',
        containLabel: true
      },
      tooltip: {
        show: true
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        type: 'value'
      },
      series: [
        { type: 'bar' }
      ]
    }
    chart.setOption(option)
  }

}

// 宽度适配
const chartResize = () => {
  requestIdleCallback(() => {
    if (chart && chartRef.value !== null) {
      const titleFontSize = chartRef.value.offsetWidth / 100 * 3.6
      const adapterOption: EChartsOption = {
        // legend: {
        //   itemHeight: titleFontSize,
        //   itemWidth: titleFontSize,
        //   itemGap: titleFontSize
        // },
        // textStyle: {
        //   fontSize: titleFontSize
        // }
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {

              borderRadius: [titleFontSize / 3, titleFontSize / 3, 0, 0]

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
  showData.value = allData.sort((a: any, b: any) => b.value - a.value)
  updateChartData()
}
// 更新图表
const updateChartData = () => {
  const colorArr = [
    ['#0BA82C', '#4FF778'],
    ['#2E72BF', '#23E5E5'],
    ['#5052EE', '#AB6EE5']
  ]
  const provinceArr = showData.value.map((item: any) => item.name)
  const valueArr = showData.value.map((item: any) => item.value)
  const dataOption: EChartsOption = {
    xAxis: {
      data: provinceArr
    },
    series: [
      {
        data: valueArr,
        itemStyle: {
          color: (arg: any) => {
            let color
            if (arg.value > 300) {
              color = colorArr[0]
            } else if (arg.value > 200) {
              color = colorArr[1]
            } else {
              color = colorArr[2]
            }
            return new proxy.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: color[0]
              },
              {
                offset: 1,
                color: color[1]
              }
            ])
          }
        }
      }
    ],
    dataZoom: {
      show: false,
      start: start,
      endValue: end
    }
  }
  chart.setOption(dataOption)
}

const push = () => {
  const dataOption: EChartsOption = {
    dataZoom: {
      start: start,
      endValue: end
    }
  }
  chart.setOption(dataOption)
}

const startInterval = () => {
  if (timer) {
    clearInterval(timer)
  }

  timer = setInterval(() => {

    start += 4
    end += 1
    if (end > allData.length) {
      start = 0
      end = 9
    }
    push()
  }, 2000)
}

proxy.$socket.registerCallBack('rankData', getData)

onMounted(async () => {
  initChart()
  // await getData()
  proxy.$socket.send({
    action: 'getData',
    socketType: 'rankData',
    chartName: 'rank',
    value: ''
  })
  startInterval()
  // 屏幕适配
  chartResize()
  window.addEventListener('resize', chartResize)
})

onBeforeUnmount(() => {
  unwatch()
  clearInterval(timer)
  window.removeEventListener('resize', chartResize)
  proxy.$socket.unRegisterCallBack('rankData')
})

</script>
<template>
  <div class="com-container">
    <div class="com-chart" ref="chartRef"></div>
  </div>
</template>
<style lang="less" scoped></style>