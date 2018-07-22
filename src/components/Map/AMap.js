const AMap = window.AMap

export function getMapObj() {
  return new AMap.Map('container', {
    resizeEnable: true,
    zoom: 10
  })
}