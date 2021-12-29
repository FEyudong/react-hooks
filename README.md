react Hooks
## 安装
### 编译发包
```
npm i zyd-react-hooks
```

## 使用文档

### **useAntdTable** 

#### 用途：
处理antd的table分页场景
#### 使用示例
```
    import { FC } from 'react';
    import { Table } from 'antd'
    import { useAntdTable } from 'lbg-hooks';
    import { PageParams } from 'lbg-hooks/lib/useAntdTable';//用来修饰页码的TS类型
    const HookDemo:FC<{}> = ()=>{

        const [queryParams, setQueryParams] = useState<Partial<ListQueryParams>>({});

        // 列表请求
        const requestTableData = async (pageParams: PageParams) => {
            const res = await get(GET_LIST, {
                ...queryParams,
                ...pageParams,
            }, true);

            return {
                total: res?.count || 0,
                data: res?.data || [],
            };
        };

        const { tableProps, resetTable, reloadTable } = useAntdTable(requestTableData, [
            queryParams,
        ]);

        return   <Table rowKey='id' columns={columns} {...tableProps} />
    }
```
<table>
        <thead>
            <th>参数</th>
            <th>解释</th>
        </thead>
        <tbody>
        <tr>
            <td>request</td>
            <td>请求方法。 需返回一个结果包含总页数及列表数据的Promise实例</td>
        </tr>
        <tr>
            <td>deps</td>
            <td>表格重置的依赖项。任意依赖项发生变化，会重置请求第一页的数据，通常是依赖一个queryState（查询表单的值状态）。
            设计灵感来源于react的useEffect，区别是在react中依赖项变化是重新运行渲染副作用，这里是重置表格数据。</td>
        </tr>
        <tr>
            <td>options</td>
            <td>自定义选项 {isInit:true;//是否在组件首次初始化时候就加载列表，默认为true}</td>
        </tr>
        </tbody>
</table>

 除了以上依靠deps参数实现的自动模式，也另外导出了一些hook内部的实用方法,以灵活应对自动模式不能满足的场景:  

```
interface Result<RecordType> {
    ...
    resetTable: () => void; // 手动重置表格 页码会重置为第一页
    reloadTable: () => void; // 手动刷新当前页的表格数据
}
```  