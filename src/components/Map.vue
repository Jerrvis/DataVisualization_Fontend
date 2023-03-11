<script setup lang='ts'>
import { ref, onMounted, getCurrentInstance, onBeforeUnmount, computed, reactive, watch } from 'vue';
import { EChartsOption } from 'echarts'
import { getPinYin } from '@/utils/map_utils'
import { useThemeStore } from '@/store/theme'
const theme = useThemeStore()
const unwatch = watch(() => theme.state, () => {
  chart.dispose()
  initChart()
  updateChartData()
  chartResize()
})

const { proxy }: any = getCurrentInstance()

const chartRef = ref<HTMLElement | null>(null)
let chart: any

let provinceShow = ''

let allData: any = ref({})

const size = ref(64)

const clickProvince = async (arg: any) => {
  const province = getPinYin(arg.name)
  if (provinceShow == province) return

  if (!proxy.$echarts[province]) {
    const res = await proxy.$http.get('province/' + province)
    provinceShow = province
    proxy.$echarts.registerMap(province, res.data)
  }
  const changeOption = {
    geo: {
      map: province
    }
  }
  chart.setOption(changeOption)
  chart.off('click', clickProvince)
}

const backToChina = () => {
  const changeOption = {
    geo: {
      map: 'china'
    }
  }
  chart.setOption(changeOption)
  provinceShow = ''
  chart.on('click', clickProvince)
}

// 初始化图表
const initChart = async () => {
  if (chartRef.value !== null) {
    const res = await proxy.$http.get('china')
    proxy.$echarts.registerMap('china', res.data)
    chart = proxy.$echarts.init(chartRef.value, theme.state)
    const option: EChartsOption = {
      geo: {
        type: 'map',
        map: 'china',
        top: '5%',
        bottom: '5%',
        itemStyle: {
          areaColor: '#2172bf',
          borderColor: '#333'
        }
      },
      title: {
        text: '▎商家分布',
        left: 20,
        top: 20
      },
      legend: {
        left: '5%',
        bottom: '5%',
        orient: 'vertical'
      }
    }
    chart.setOption(option)
    chart.on('click', clickProvince)
  }

}

// 获取数据
const getData = (data: any) => {
  // const res = await proxy.$http.get('map')
  allData.value = data
  updateChartData()
}

// 更新图表
const updateChartData = () => {
  const legendArr = allData.value.map((item: any) => item.name)
  const seriesArr = allData.value.map((item: any) => {
    return {
      type: 'effectScatter',
      name: item.name,
      data: item.children,
      coordinateSystem: 'geo',
      rippleEffect: {
        scale: 5,
        brush: 'stroke'
      }
    }
  })
  const dataOption: EChartsOption = {
    series: seriesArr,
    legend: {
      data: legendArr
    }
  }
  chart.setOption(dataOption)
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
            fontSize: titleFontSize
          }
        },
        legend: {
          itemHeight: titleFontSize / 2,
          itemWidth: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      chart.setOption(adapterOption)
      chart.resize()
    }
  })
}

proxy.$socket.registerCallBack('mapData', getData)

onMounted(async () => {
  await initChart()
  // await getData()
  // updateChartData()
  proxy.$socket.send({
    action: 'getData',
    socketType: 'mapData',
    chartName: 'map',
    value: ''
  })
  // 屏幕适配
  chartResize()
  window.addEventListener('resize', chartResize)
})

onBeforeUnmount(() => {
  unwatch()
  window.removeEventListener('resize', chartResize)
  proxy.$socket.unRegisterCallBack('mapData')
})
</script>
<template>
  <div class="com-container" @dblclick="backToChina">
    <div class="com-chart" ref="chartRef">map</div>
  </div>
</template>
<style lang='less' scoped></style>