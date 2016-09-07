<?php
error_reporting(-1);
ini_set('error_reporting', E_ALL);

include "../../php/config.php";
include "../../php/mysql.php";

$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);

$baseQuery = (isset($_POST["baseQuery"]) && !empty($_POST["baseQuery"])) ? urldecode($_POST["baseQuery"]) : NULL;
$switrs = (isset($_POST["switrs"]) &&  !empty($_POST["switrs"])) ? json_decode(urldecode($_POST["switrs"]), true) : NULL;
$party = (isset($_POST["party"]) &&  !empty($_POST["party"])) ? json_decode(urldecode($_POST["party"]), true) : NULL;
$victim = (isset($_POST["victim"]) &&  !empty($_POST["victim"])) ? json_decode(urldecode($_POST["victim"]), true) : NULL;

if ($baseQuery) {
  $parameterArray = [];
  function generateQuery($item, $value) {
    global $parameterArray;
    if (is_array($value)) {
      if (count($value) == 1) {
        $where = "(";
        foreach ($value as $m => $x) {
          //for yes or no columns which has null value o empty value as no instead of N
          if (in_array($item, array("S.PEDCOL", "S.BICCOL", "S.MCCOL", "S.TRUCKCOL", "S.ETOH")) && $x == "N") {
            $where .= $item." IS NULL OR ".$item." = ''";
          }
          else {
            if ($x == "NULL" || $x == "") {
              $where .= $item." IS NULL OR ".$item." = ''";
            }
            else {
              $where .= $item." = ?";
              $parameterArray[] = $x;
            }
          }
        }
        $where .= ")";
      }
      else {
        if ($item == "P.PAGE" || $item == "V.VAGE" || $item == "V.PARNUM") {
          $where = "(".$item." BETWEEN ? AND ?)";
        }
        else {
          $where = $item." IN (".str_repeat("?,", count($value) - 1)."?)";
        }
        $parameterArray = array_merge($parameterArray, array_values($value));
      }
    }
    else {
      $where = $item." = ?";
      $parameterArray[] = $value;
    }
    return $where;
  }
  $tables = "switrs_all_new S";
  if (!is_null($switrs) && !empty($switrs)) {
    foreach ($switrs as $k => $v) {
      $item = "S.".$k;
      $baseQuery .= " AND ".generateQuery($item, $v);
    }
  }
  if (!is_null($party) && !empty($party)) {
    $tables .= ", party_new P";
    $baseQuery .= " AND S.CASEID = P.CASEID";
    foreach ($party as $k => $v) {
      $item = "P.".$k;
      $baseQuery .= " AND ".generateQuery($item, $v);
    }
  }
  if (!is_null($victim) && !empty($victim)) {
    $tables .= ", victim_new V";
    $baseQuery .= " AND S.CASEID = V.CASEID";
    foreach ($victim as $k => $v) {
      $item = "V.".$k;
      $baseQuery .= " AND ".generateQuery($item, $v);
    }
  }
  $db->select($tables, "DISTINCT S.CASEID", $baseQuery, "", 5);
  if (!empty($parameterArray)) {
    $db->parameters($parameterArray, 5);
  }
  $db->close();

  echo json_encode($result);
}
else {
  echo false;
}
?>