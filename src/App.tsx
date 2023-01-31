import React, { lazy, Suspense, useState } from 'react'
import Testing from "./components/Testing"
import Demo1 from "./components/demo1"
import Demo2 from "./components/demo2"

// 懒加载：使用import语法配合react的Lazy动态引入资源
const LazyDemo = lazy(() => import('@/components/lazyDemo'));

// prefetch 可能需要的资源，浏览器不一定会加载这些资源,会在空闲时加载 
const PreFetchDemo = lazy(() => import(
    /* webpackChunkName: "PreFetchDemo" */
    /*webpackPrefetch: true*/
    '@/components/PreFetchDemo'
));

// preload 一定要加载
const PreloadDemo = lazy(() => import(
    /* webpackChunkName: "PreloadDemo" */
    /*webpackPreload: true*/
    '@/components/PreloadDemo'
));


import './app.css'
import './app.less'

function App() {
    const [ count, setCounts ] = useState('');
    const [ show, setShow ] = useState(false);

    const onChange = (e: any) => {
        setCounts(e.target.value)
    }

    // 点击事件中动态引入css, 设置show为true
    const onClick = () => {
        setShow(true);
    }

    return (
        <div>
            <h2>webpack5-react-ts</h2>
            <p>typeScript</p>
            <p>{count}</p>
            <Testing/>
            <Demo1/>
            <h2>webpack5+react+ts</h2>
            <input type="text" value={count} onChange={onChange} />

            <h2 onClick={onClick}>点击懒加载 && 预加载</h2>
            {/* show为true时加载LazyDemo组件 */}
            { show && <Suspense fallback={null}><LazyDemo /></Suspense> }

            { show && (
                 <>
                    <Suspense fallback={null}><PreloadDemo /></Suspense>
                    <Suspense fallback={null}><PreFetchDemo /></Suspense>
                </>
            )}
        </div>
    )
}

export default App