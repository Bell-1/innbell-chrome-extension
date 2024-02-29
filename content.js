// content.js

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  const tableWrap = document.getElementById("sycm-mc-mq-relate-analysis")

  if (!tableWrap) return alert('请在淘宝生意参谋/市场/搜索分析页面内使用')

  if (request.action === "exportTable") {
    // 导出查词结果表格
    exportSearchWordAnalysisTableData(tableWrap);
  }

  if (request.action === "ChangeTaobaoSearchWordCondition") {
    // 修改查词条件
    changeTaobaoSearchWordCondition(tableWrap);
  }
});




// 导出市场搜索分析表单数据
function exportSearchWordAnalysisTableData(rootEl) {


  // 获取表格数据的逻辑
  const tableData = getTableData(rootEl);

  // 创建工作簿和工作表
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(tableData, { skipHeader: true });

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // 保存文件
  XLSX.writeFile(wb, "exported_data.xlsx");
}

function getTableData(rootEl) {

  // 获取表格数据的逻辑
  const table = rootEl.querySelector('table')
  const tableRows = table.querySelectorAll('tr')
  const data = [];
  let indexForSearchNumber = -1
  let indexForCount = -1

  tableRows.forEach((row, index) => {
    const cells = [...row.querySelectorAll(index === 0 ? 'th': 'td')];
    // 不要最后操作列
    cells.pop()
    // 单元数据
    const rowData = cells.map(cell => {
      
      let text = cell.textContent.trim().replace(/[,，]/g, '');
      try {
        if(`${+text}` === text){
          text = +text
        }
        
      } catch (err){
        console.error('转数字失败',text, err)
      }

      
      return text
    })

    if(rowData[0].length >= 18){
      // 过滤标题太长的条件
      return
    }

    if(index === 0) {
      // 添加竞争指数列
      rowData.push('竞争指数')
    } else {
      // 计算竞争指数
      indexForSearchNumber = (indexForSearchNumber === -1 ? data[0].findIndex(item => item === '搜索人气') : indexForSearchNumber)
      indexForCount = (indexForCount === -1 ? data[0].findIndex(item => item === '在线商品数') : indexForCount)
      if(indexForSearchNumber + indexForCount !== -2) {
        rowData.push(rowData[indexForSearchNumber] / rowData[indexForCount])
      }
    }

    // 存入table Data 
    data.push(rowData);
  });

  return data;
}


function changeTaobaoSearchWordCondition() {
  const ul = document.querySelector('ul.oui-index-picker-list')

  if (!ul) return alert('不存在条件选择，请检查页面是否正确')

  const liList = [...ul.querySelectorAll('li')]

  const targetConditions = [
    '搜索人气',
    // '搜索热度',
    '点击率',
    // '点击人气',
    // '点击热度',
    // '交易指数',
    '支付转化率',
    '在线商品数',
    // '商城点击占比',
    // '直通车参考价',
  ]

  liList.forEach(item => {
    const label = item.querySelector('label')
    const labelText = label.textContent.trim()
    if(targetConditions.includes(labelText)){
      // 需要勾选的项
      if(!label.querySelector('span.ant-checkbox-checked')){
        // 如果没有勾选，点击勾上
        label.click()
      }
    } else if(label.querySelector('span.ant-checkbox-checked')){
      // 不需要且是勾选的，点击取消勾选
      label.click()
    }
  })

}
