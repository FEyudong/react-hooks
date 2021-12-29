/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { TableProps } from 'antd';

export interface PageParams {
  pageNum: number;
  pageSize: number;
}

export type RequestHandler<RecordType> = (
  pageParams: PageParams
) => Promise<{ data: Array<RecordType>; total: number }>; // 请求数据的方法

type Options = {
  isInit?: boolean; // 是否在初始化时候默认触发一次请求 默认为true
};

export interface Result<RecordType> {
  tableProps: TableProps<RecordType>; // 表格属性
  resetTable: () => void; // 手动重置表格 页码会重置为第一页
  reloadTable: () => void; // 手动刷新当前页的表格数据
}
/**
 * @description 方便使用antd表格，提供了分页自动处理功能
 * @param request 请求方法。 需返回一个结果包含总页数及列表数据的Promise实例
 * @param deps 表格重置的依赖项。 任意依赖项发生变化，重置页码为1，自动调用request方法，灵感来源于react的useEffect，区别是react是依赖变化运行副作用，这里是重置表格数据。
 * @param Options 自定义选项 {isInit:true;} 是否在初始化时候默认触发一次请求 默认为true
 * @returns Result<T>
 */

export default function useAntdTable<T = object>(
    request: RequestHandler<T>,
    deps: any[] = [],
    tableProps: TableProps<T> = {},
    options?: Options,
): Result<T> {
    const [dataList, setDataList] = useState([]); // 列表数据
    const defaultPageSize = (tableProps?.pagination && tableProps?.pagination.defaultPageSize) || 10;
    const [pageParams, setPageParams] = useState({
        pageNum: 1,
        pageSize: defaultPageSize,
    }); // 当前页码及每页条数

    const [total, setTotal] = useState(0); // 数据总条数
    const [isFetching, setIsFetching] = useState(false); // 是否处于请求中
    const isInitFlagRef = useRef(true); // 标示下是否是首次初始化渲染

    const { isInit = true } = options || {};

    const fetchData = async () => {
        try {
            setIsFetching(true);
            // eslint-disable-next-line no-shadow
            const { data, total } = (await request(pageParams)) || {};

            setDataList(data || []);
            setTotal(total || 0);
        } catch (error) {
            setDataList([]);
            throw Error(error)
        }

        isInitFlagRef.current = false;
        setIsFetching(false);
    };

    const stopInitReq = useRef(isInit === false);

    // 分页请求
    useEffect(() => {
        if (stopInitReq.current) { // isInit选项为true,禁止初始化时候去请求列表
            stopInitReq.current = false;

            return;
        }

        fetchData();
    }, [pageParams]);

    // 依赖项变化，重置分页
    useEffect(() => {
        const isNeedRest = isInitFlagRef.current === false; // 只在更新场景才调用重置，首次初始化不需要

        isNeedRest && setPageParams({
            ...pageParams,
            pageNum: 1,
        });
    }, deps);

    const onChange = ({ current, pageSize }) => {
        setPageParams({
            pageNum: pageSize === pageParams.pageSize ? current : 1,
            pageSize,
        });
    };

    return {
        tableProps: {
            ...tableProps,
            loading: isFetching,
            onChange,
            dataSource: dataList,
            pagination: tableProps.pagination !== false && {
                ...tableProps.pagination,
                current: pageParams.pageNum,
                pageSize: pageParams.pageSize,
                total,
            },
        },
        resetTable() {
            setPageParams({
                ...pageParams,
                pageNum: 1,
            });
            setTotal(0);
            setDataList([]);
        },
        reloadTable() {
            fetchData();
            setTotal(0);
            setDataList([]);
        },
    };
}
