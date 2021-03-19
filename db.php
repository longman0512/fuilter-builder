<?php 
$dbhost = "localhost";
$dbuser = "root";
$dbpass = "";
$db = "treeview";
$conn = new mysqli($dbhost, $dbuser, $dbpass,$db) or die("Connect failed: %s\n". $conn -> error);
$data = $_POST['id'];
    
    switch($data){
        case $data == "get":
            $result = $conn->query("SELECT * FROM data");
            // var_dump($result);
            $data = array();
            foreach($result as $res){
                $data[] = $res;
            }
            return print_r(json_encode($data));
            break;
        case $data == "getFilters":
            $filter_values = $conn->query("SELECT * FROM filter_values");
            $filters = $conn->query("SELECT * FROM filters");
            $data = array();
            $data['filters'] = array();
            $data['filter_values'] = array();
            
            foreach($filters as $res){
                $data['filters'][] = $res;
            }
            foreach($filter_values as $res){
                $data['filter_values'][] = $res;
            }
            return print_r(json_encode($data));
            break;
        case $data == "add":
            $insData = json_decode($_POST['data']);
            $conn->query("TRUNCATE TABLE `data`");
            for($i = 0; $i < count($insData); $i++){
                // var_dump($insData[$i]->id);
                $catId = str_replace("'", "", $insData[$i]->innercode);
                $catId = (integer)$catId;
                $conn->query("INSERT INTO `data` (`id`, `name`, `pid`, `innercode`) VALUES (".$insData[$i]->id.", '".$insData[$i]->name."', ".$insData[$i]->pid.", ".$catId.")");
            }
            break;
        case $data == "addFilter":
            $insData = json_decode($_POST['data']);
            
            $conn->query("TRUNCATE TABLE `filters`");
            $conn->query("TRUNCATE TABLE `filter_values`");
            $query = "";
            for($i = 0; $i < count($insData); $i++){
                $defaultString = "";
                if(isset($insData[$i]->detail))
                foreach($insData[$i]->detail as $detail){
                    $query .= " INSERT INTO `filter_values` (`filter_id`, `value`, `label`) VALUES (\"".($i+1)."\", \"".$detail->value."\", \"".$detail->label."\");";
                    if($detail->defaultFlag){
                        $defaultString .= $detail->value.",";
                    }
                }
                if($insData[$i]->type == "exact" || $insData[$i]->type == "exact-number"){
                    $query .= " INSERT INTO `filters` (`filter_type`, `name_label`, `category`, `default`, `recursive`) VALUES (\"".$insData[$i]->type."\", \"".$insData[$i]->label."\", \"".$insData[$i]->pid."\", \"".$insData[$i]->default."\", \"".$insData[$i]->recursive."\");";
                } else {
                    $query .= " INSERT INTO `filters` (`filter_type`, `name_label`, `category`, `default`, `recursive`) VALUES (\"".$insData[$i]->type."\", \"".$insData[$i]->label."\", \"".$insData[$i]->pid."\", \"".$defaultString."\", \"".$insData[$i]->recursive."\");";
                }
            }
            mysqli_multi_query($conn, $query);
            break;
    }

?>