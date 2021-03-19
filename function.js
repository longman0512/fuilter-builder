function changeFilterType(e) {
  filterType = e.target.value
  filterLabel = document.getElementById("filterLabel").value
  switch (e.target.value) {
    case "checkbox":
      document.getElementById("selectPanel").style.display = "block"
      document.getElementById("exactPanel").style.display = "none"
      document.getElementById("rangePanel").style.display = "none"
      break;
    case "radio":
      document.getElementById("selectPanel").style.display = "block"
      document.getElementById("exactPanel").style.display = "none"
      document.getElementById("rangePanel").style.display = "none"
      document.getElementById("multiItemDefault1").checked = true
      for (var i = 1; i < itemNum; i++) {
        document.getElementById("multiItemDefault"+(i+1)).checked = false
      }
      break;
    case "select":
      document.getElementById("selectPanel").style.display = "block"
      document.getElementById("exactPanel").style.display = "none"
      document.getElementById("rangePanel").style.display = "none"
      break;
    case "multi-select":
      document.getElementById("selectPanel").style.display = "block"
      document.getElementById("exactPanel").style.display = "none"
      document.getElementById("rangePanel").style.display = "none"
      break;
    case "exact-number":
      document.getElementById("rangePanel").style.display = "block"
      document.getElementById("selectPanel").style.display = "none"
      document.getElementById("exactPanel").style.display = "none"
      break;
    case "exact":

      document.getElementById("exactPanel").style.display = "block"
      document.getElementById("rangePanel").style.display = "none"
      document.getElementById("selectPanel").style.display = "none"
      break;
  }
}

function checkType (e) {
  var index = e.target.id.replace( /^\D+/g, '')
  var filterType = document.getElementById("FilterType").value
  if(filterType == "radio"){
    for (var i = 0; i < itemNum; i++) {
      if(index != i+1){
        document.getElementById("multiItemDefault"+(i+1)).checked = false
      }
    }
  }
}

function addMultipleItem() {
  var mutiplePanel = $("#selectPanel");
  itemNum += 1
  document.getElementById("removeBtn").style.display = "block"
  mutiplePanel.append("<div class=\"row mTop-30\"><div class=\"col-md-4\"><div class=\"input-group\"><span class=\"input-group-text\">Label</span><input type=\"text\" class=\"form-control\" aria-label=\"With textarea\"  id=\"multiItemLabel" + itemNum + "\" ></input></div></div><div class=\"col-md-4\"><div class=\"input-group\"><span class=\"input-group-text\">Value</span><input type=\"text\" class=\"form-control\" aria-label=\"With textarea\" id=\"multiItemValue" + itemNum + "\"></input> </div></div><div class=\"col-md-4\"><div class=\"form-check\"><input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"multiItemDefault" + itemNum + "\" onclick=\"checkType(event)\"><label class=\"form-check-label\" for=\"multiItemDefault" + itemNum + "\">Set as Default</label></div></div></div>")

}

function removeMultipleItem() {
  var mutiplePanel = $("#selectPanel").children().last();
  itemNum -= 1
  if (itemNum == 1) {
    document.getElementById("removeBtn").style.display = "none"
  }
  mutiplePanel.remove()
}

function modalRebuild() {
  itemNum = 1
  document.getElementById("ppid").value = ""
  document.getElementById("filterLabel").value = ""
  document.getElementById("recursive").checked = false
  document.getElementById("FilterType").value = "checkbox"
  
  var selectPanel = document.getElementById("selectPanel")
  var exactPanel = document.getElementById("exactPanel")
  var rangePanel = document.getElementById("rangePanel")

  selectPanel.innerHTML = "<div class=\"row mTop-30\"><div class=\"col-md-3\"><button type=\"button\" class=\"btn btn-primary mb-3\" onclick=\"addMultipleItem()\">Add new Item</button></div><div class=\"col-md-3\"><button type=\"button\" class=\"btn btn-warning mb-3\" style=\"display:none;\" id=\"removeBtn\" onclick=\"removeMultipleItem()\">Remove Item</button></div>	</div><div class=\"row mTop-30\"><div class=\"col-md-4\"><div class=\"input-group\"><span class=\"input-group-text\">Label</span><input type=\"text\" class=\"form-control\" id=\"multiItemLabel1\" aria-label=\"With textarea\"></input></div></div><div class=\"col-md-4\"><div class=\"input-group\"><span class=\"input-group-text\">Value</span><input type=\"text\" class=\"form-control\" id=\"multiItemValue1\" aria-label=\"With textarea\"></input></div></div><div class=\"col-md-4\"><div class=\"form-check\"><input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"multiItemDefault1\" onclick=\"checkType(event)\"><label class=\"form-check-label\" for=\"multiItemDefault1\">Set as Default</label></div></div></div>";

  exactPanel.innerHTML = "<div class=\"row mTop-30\"><div class=\"col-md-12\"><div class=\"input-group\"><span class=\"input-group-text\">Min Default Value</span><input type=\"text\" class=\"form-control\" id=\"exactDefValue\" aria-label=\"With textarea\"></input></div></div></div>";

  rangePanel.innerHTML = "<div class=\"row mTop-30\"><div class=\"col-md-12\"><div class=\"input-group\"><span class=\"input-group-text\">Default Value</span><input type=\"number\" class=\"form-control\" id=\"defValue\" aria-label=\"With textarea\"></input></div></div></div>";

  document.getElementById("selectPanel").style.display = "block"
  document.getElementById("exactPanel").style.display = "none"
  document.getElementById("rangePanel").style.display = "none"
}

function removeChild(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function saveNewFilter() {

  filterLabel = document.getElementById("filterLabel").value
  if (!filterLabel) {
    alert("Please insert filter label")
    document.getElementById("filterLabel").focus()
    return false
  }
  recursive = document.getElementById("recursive").checked
  filterType = document.getElementById("FilterType").value
  filterElement.type = filterType
  filterElement.label = filterLabel
  filterElement.recursive = recursive

  var defaultFlagNum = 0
  if (filterType == "checkbox" || filterType == "multi-select") {
    filterElement.detail = []
    var temp = []
    for (var i = 0; i < itemNum; i++) {
      var label = document.getElementById("multiItemLabel" + (i + 1)).value
      var value = document.getElementById("multiItemValue" + (i + 1)).value
      if (!label) {
        alert("Please insert the label")
        document.getElementById("multiItemLabel" + (i + 1)).focus()
        return false
      } else if (!value) {
        alert("Please insert the value")
        document.getElementById("multiItemValue" + (i + 1)).focus()
        return false
      }
      var defaultFlag = document.getElementById("multiItemDefault" + (i + 1)).checked
      temp.push({
        label: label,
        value: value,
        defaultFlag: defaultFlag
      })
    }
    filterElement.detail = temp
  } else if (filterType == "select" || filterType == "radio") {
    filterElement.detail = []
    var temp = []
    for (var i = 0; i < itemNum; i++) {
      var label = document.getElementById("multiItemLabel" + (i + 1)).value
      var value = document.getElementById("multiItemValue" + (i + 1)).value
      var defaultFlag = document.getElementById("multiItemDefault" + (i + 1)).checked
      if (!label) {
        alert("Please insert the label")
        document.getElementById("multiItemLabel" + (i + 1)).focus()
        return false
      } else if (!value) {
        alert("Please insert the value")
        document.getElementById("multiItemValue" + (i + 1)).focus()
        return false
      }
      if (defaultFlag) defaultFlagNum++
      temp.push({
        label: label,
        value: value,
        defaultFlag: defaultFlag
      })
    }
    if (defaultFlagNum > 1) {
      alert("Please select only one item as default when you select the type as select or radio")
      return false
    }
    filterElement.detail = temp
  } else if (filterType == "exact") {
    filterElement.default = document.getElementById("exactDefValue").value
  } else if (filterType == "exact-number") { // exact-number
    filterElement.default = document.getElementById("defValue").value
  }
  modal.style.display = "none";
  var pid = document.getElementById("ppid").value
  if (pid) {
    filters[pid] = filterElement
    console.log(pid, filterElement, "when edit node")
    document.getElementById("j-saveFilter").click()
    modalRebuild()
  } else {
    console.log(filterElement)

    document.getElementById("j-saveFilter").click()
    modalRebuild()
  }
}