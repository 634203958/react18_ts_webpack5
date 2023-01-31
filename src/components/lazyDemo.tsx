import React, { PureComponent } from "react";

// 装饰器为,组件添加age属性
function addAge(Target: Function) {
  Target.prototype.age = 111
}

// 使用装饰圈
@addAge
class LazyDemo extends PureComponent {

  age?: number

  render() {
    return (
      <h2>我是懒加载组件---{this.age}</h2>
    )
  }
}

export default LazyDemo