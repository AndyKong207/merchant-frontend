import React, { Component } from 'react'
import { Drawer, Spin, Col, Row } from 'antd'
import { getMapObj } from '../components/Map/AMap'
import { query } from '../services/merchant'

const AMap = window.AMap

const pStyle = {
  fontSize: 16,
  color: 'rgba(0,0,0,0.85)',
  lineHeight: '24px',
  display: 'block',
  marginBottom: 16,
};

const DescriptionItem = ({ title, content }) => {
  return (
    <div
      style={{
        fontSize: 14,
        lineHeight: '22px',
        marginBottom: 7,
        color: 'rgba(0,0,0,0.65)',
      }}
    >
      <p
        style={{
          marginRight: 8,
          display: 'inline-block',
          color: 'rgba(0,0,0,0.85)',
        }}
      >
        {title}:
      </p>
      {content}
    </div>
  );
};

class Map extends Component {
  constructor() {
    super(...arguments)
    this.state = {
      visible: false,
      merchant: null,
      loading: true
    }
    this.map = null
    this.cluster = null
    this.markers = []
  }
  componentDidMount = async () => {
    const points = []


    const result = await query()
    this.setState({loading: false})

    for (const item of result.data) {
      const point = { lnglat: [item.longitude, item.latitude], ...item }
      points.push(point)
    }

    if (this.map === null) {
      this.map = getMapObj()
      this.map.plugin(["AMap.ToolBar"], () => {
        //加载工具条
        const tool = new AMap.ToolBar()
        this.map.addControl(tool)
      })
    }

    AMap.plugin('AMap.MarkerClusterer', () => {
      for (const item of points) {
        const marker = new AMap.Marker({
          position: item['lnglat'],
          offset: new AMap.Pixel(-15, -15),
          extData: item
        })
        this.markers.push(marker)
        AMap.event.addListener(marker, 'click', this._onMarkerEvent)
      }
      this.count = this.markers.length
      this.addCluster()
    })
  }

  _onMarkerEvent = async (e) => {
    const merchant = e.target.F.extData
    // console.log(e.target.F)
    this.showDrawer(merchant)
  }


  _renderCluserMarker = (context) => {
    const count = this.count
    const factor = Math.pow(context.count / count, 1 / 18)
    const div = document.createElement('div')
    const Hue = 60 + factor * 180
    const bgColor = 'hsla(' + Hue + ',100%,50%,0.7)'
    const fontColor = 'hsla(' + Hue + ',100%,20%,1)'
    const borderColor = 'hsla(' + Hue + ',100%,40%,1)'
    const shadowColor = 'hsla(' + Hue + ',100%,50%,1)'
    div.style.backgroundColor = bgColor
    const size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20)
    div.style.width = div.style.height = size + 'px'
    div.style.border = 'solid 1px ' + borderColor
    div.style.borderRadius = size / 2 + 'px'
    div.style.boxShadow = '0 0 1px ' + shadowColor
    div.innerHTML = context.count
    div.style.lineHeight = size + 'px'
    div.style.color = fontColor
    div.style.fontSize = '14px'
    div.style.textAlign = 'center'
    context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2))
    context.marker.setContent(div)
  }

  addCluster = () => {
    if (this.cluster) {
      this.cluster.setMap(null)
    }
    this.cluster = new AMap.MarkerClusterer(this.map, this.markers, {
      minClusterSize: 2,
      maxZoom: 16,
      gridSize: 80,
      renderCluserMarker: this._renderCluserMarker
    })
  }

  showDrawer = (merchant) => {
    console.log(merchant)
    this.setState({
      visible: true,
      merchant
    })
  }

  onClose = () => {
    this.setState({
      visible: false,
      merchant: null
    })
  }


  render() {
    const { visible, merchant, loading } = this.state
    return (
      <Spin tip="数据加载中，请稍后..." spinning={loading}>
        <div style={{ height: '100vh' }}>
          {
            merchant && <Drawer
              title="收钱吧商户信息"
              placement="left"
              closable={false}
              onClose={this.onClose}
              visible={visible}
            >
              <p style={{ ...pStyle, marginBottom: 24 }}>{merchant.name}</p>
              <p style={pStyle}>{`${merchant.province} ${merchant.city} ${merchant.district} ${merchant.street_address}`}</p>
              <Row>
                <Col span={24}>
                  <DescriptionItem title="店主" content={merchant.contact_name} />{' '}
                </Col>
                <Col span={24}>
                  <DescriptionItem title="联系方式" content={merchant.contact_phone} />
                </Col>
              </Row>
            </Drawer>
          }

          <div id='container' style={{ width: '100%', height: '100%' }}></div>
        </div>
      </Spin>
    )
  }
}

export default Map
