<?
use VK\OAuth\VKOAuth;
use VK\OAuth\VKOAuthDisplay;
use VK\OAuth\VKOAuthResponseType;
use VK\OAuth\Scopes\VKOAuthGroupScope;
use VK\OAuth\Scopes\VKOAuthUserScope;
use VK\Client\VKApiClient;
use VK\Client\VKApiRequest;
use VK\TransportClient\Curl\CurlHttpClient;
/**
* Class Api
* @package Api
*/
class vkApi {
    
    const VK_GROUP_TOKEN = 'test';
    const VK_SERVICE_TOKEN = 'test';
    const GROUP_CODE = "test";
    const TOKEN = "test"; // любая строка она вернется обратно
    const CLIENT_ID = 1; // id приложения
    const USER_ID = 1; // мой id в вк
    const CLIENT_SECRET = 'Xw2R1vm1e6faR8EvfXsZ'; // секретный ключ приложения
    const REDIRECT_URI = 'https://gexin.ru/vk/blank.php';
    const REDIRECT_URI_ACF = 'https://gexin.ru/vk/';
    const OWNER_ID = 1; //ID группы
    const VERSION = '5.92';
    //owner_id = -95425681

    public $token;
    public $vk;
        
    function __construct() {
        self::saveToken();
        $this->vk = new VKApiClient();
    }
    
    /**
     * Инициализация токена
     * @return
     */
    function saveToken(){
        if ($_REQUEST["authToken"] && check_bitrix_sessid()) {
            $this->token = $_REQUEST["authToken"];
            COption::SetOptionString("main","vk_token",$this->token);
        } elseif ($t = COption::GetOptionString("main", "vk_token")) {
            $this->token = $t;
        }
    }

    /**
     * Авторизация чере апи вк
     * @param array $options параметры
     * @return
     */
    function VK_auth($options = []){
        // Авторизация
        if (!$this->token) {
            $this->oauth = new VKOAuth();
            $code = $_REQUEST["code"]?
                $_REQUEST["code"]:
                ($_REQUEST["access_token"]?$_REQUEST["access_token"]:$_REQUEST["access_token_".static::OWNER_ID]);
            
            switch ($options["method"]) {
                case "IF":
                    if ($_REQUEST["state"] == static::TOKEN && $code) {
                        $this->getAccessTokenIF($code);
                    } else {
                        $this->getCodeIF();
                    }
                break;
                default :
                    if ($_REQUEST["state"] == static::TOKEN && $code) {
                        $this->getAccessTokenACF($code);
                    } else {
                        $this->getCodeACF();
                    }
            }
        }
    }
    
    /**
     * Получение токена методом Autorization Code Flow
     * @param string $code код от апи вк
     * @return
     */
    function getAccessTokenACF($code = ''){
        $response = $this->oauth->getAccessToken(static::CLIENT_ID, static::CLIENT_SECRET, 
            static::REDIRECT_URI, $code);
        if ($response["access_token"]) {
            COption::SetOptionString("main","vk_token",$response["access_token"]);
            header('Location: '.static::REDIRECT_URI_ACF);
        }
    }
    
    /**
     * Получение спец. кода методом Autorization Code Flow
     * @return
     */
    function getCodeACF(){
        $scope = array(140492095); // все возможные разрешения (сумма)
        //$scope = array(VKOAuthGroupScope::MESSAGES); 
        //$groups_ids = array(1, 2); 
        $browser_url = $this->oauth->getAuthorizeUrl(VKOAuthResponseType::CODE, static::CLIENT_ID, 
            static::REDIRECT_URI_ACF, VKOAuthDisplay::PAGE, $scope, static::TOKEN, $groups_ids);
        header('Location: '.$browser_url);
    }
    
    /**
     * Получение токена методом Implict Flow
     * @param string $code код доступа access_token
     * @return
     */
    function getAccessTokenIF($code = ''){
        COption::SetOptionString("main","vk_token",$code);
    }
    
    /**
     * Получение кода методом Implict Flow
     * @return
     */
    function getCodeIF(){
        //$groups_ids = [95425681];
        if (strpos($_SERVER["HTTP_REFERER"],"vk.com") === false) {
            $scope = array(VKOAuthUserScope::WALL);
            $browser_url = $this->oauth->getAuthorizeUrl(VKOAuthResponseType::TOKEN, static::CLIENT_ID, 
                static::REDIRECT_URI, VKOAuthDisplay::PAGE, $scope, static::TOKEN,$groups_ids);
            header('Location: '.$browser_url);
        }
    }
    
    /**
     * Возвращает инфу о сообществе
     * @param array $options параметры для выборки
     * @return array
     */
    function VK_getGroupInfo($options = []){
        $data = [
            "group_id"=>static::GROUP_CODE,
        ];
        $data = array_merge($data,$options);
        $response = $this->vk->groups()->getById(static::VK_SERVICE_TOKEN, $data);
        return $response;
    }
    /**
     * Получение списка записей со стены группы
     * @param array $options параметры для выборки
     * @return array
     */
    function VK_getWall($options = []){
        $data = [
            "domain"=>static::GROUP_CODE,
            "offset"=>0,
            "count"=>100
        ];
        $data = array_merge($data,$options);
        $response = $this->vk->wall()->get(static::VK_SERVICE_TOKEN, $data);
        return $response;
    }
    
    /**
     * Отправить сообщение на стену
     * @param array $options параметры для записи
     * @return array
     */
    function VK_postWall( $options = []){
        $data = [
            "owner_id"=>-static::OWNER_ID,
            "from_group"=>1,
            "v"=> static::VERSION
        ];
        $data = array_merge($data,$options);
        $response = $this->vk->wall()->post($this->token, $data);
        return $response;
    }
    
    /**
     * Получение адреса для загрузки фото,видео и т.п.
     * @param array $options параметры
     * @return array
     */
    function VK_getWallUploadServer( $options = []){
        $data = [
            "owner_id"=>-static::OWNER_ID,
            "v"=> static::VERSION
        ];
        $data = array_merge($data,$options);
        $response = $this->vk->photos()->getWallUploadServer($this->token, $data);
        return $response;
    }
    
    /**
     * Постинг картинки на стену группы
     * @param array $options параметры
     * @return array
     */  
    function VK_postWallImg( $options = []){
        $r = $this->VK_getWallUploadServer();// получить урл для закачки
        $files = $options["files"];
        if ($r["upload_url"] && $files) {
            if (!is_array($files)) $files = [$files];
            $attach = [];
            foreach ($files as $f) {
                // закачать картинку
                $response = $this->vk->getRequest()->upload($r["upload_url"],"photo",$_SERVER["DOCUMENT_ROOT"].$f);
                if ($response["photo"]) {
                    // сохранить картинку в базе вк
                    $response = $this->vk->photos()->saveWallPhoto($this->token, $response);
                    foreach ($response as $img) {
                        $attach[] = "photo".$img["owner_id"]."_".$img["id"];
                    }
                }
            }
            
            unset($options["files"]);
            if ($options["link"]) $attach[] = $options["link"];
            
            if ($attach) {
                // массив с картинками для постинга на стену
                $data = [
                    "attachments"=>implode(',',$attach)
                ];
                $data = array_merge($data,$options);
                $response = $this->VK_postWall($data);
            }
        }
        return $response;
    }
    
    /**
     * Загрузка видео в группу
     * @param array $options параметры
     * @return array|null
     */  
    function VK_postWallVideo( $options = []){
        $files = $options["files"];
        $ids = $options["ids"];
        $data = [
            "group_id"=>static::OWNER_ID,
            "v"=> static::VERSION,
            "wallpost"=>1
        ];
        $data = array_merge($data,$options);
        if ($files) {
            $r = $this->vk->video()->save($this->token, $data);
            if ($r["upload_url"] ) {
                if (!is_array($files)) $files = [$files];
                foreach ($files as $f) {
                    // закачать видео
                    $f = filter_var($f, FILTER_VALIDATE_URL)?$f:$_SERVER["DOCUMENT_ROOT"].$f;
                    $response = $this->vk->getRequest()->upload($r["upload_url"],"photo",$f);
                }
            }
        } elseif ($ids) {
            
        } elseif ($options["link"]) {
            $r = $this->vk->video()->save($this->token, $data);
            if ($r["upload_url"]) {
                $c = new CurlHttpClient(10);
                $response = $c->post($r["upload_url"]);
            }
        }
        return $response;
    }
    
    /**
     * Загрузка доков в группу, например gif
     * @param array $options параметры
     * @return array
     */  
    function VK_postWallDoc( $options = []){
        $files = $options["files"];
        $ids = $options["ids"];
        $data = [
            "group_id"=>static::OWNER_ID,
            "v"=> static::VERSION,
            "wallpost"=>1
        ];
        $data = array_merge($data,$options);
        if ($files) {
            $r = $this->vk->video()->save($this->token, $data);
            if ($r["upload_url"] ) {
                if (!is_array($files)) $files = [$files];
                foreach ($files as $f) {
                    // закачать видео
                    $f = filter_var($f, FILTER_VALIDATE_URL)?$f:$_SERVER["DOCUMENT_ROOT"].$f;
                    $response = $this->vk->getRequest()->upload($r["upload_url"],"photo",$f);
                }
            }
        } elseif ($ids) {
            
        } elseif ($options["link"]) {
            $r = $this->vk->video()->save($this->token, $data);
            if ($r["upload_url"]) {
                $c = new CurlHttpClient(10);
                $response = $c->post($r["upload_url"]);
            }
        }
        return $response;
    }
    
    
    /**
     * Возвращает все фото группы
     * @param array $options параметры
     * @return array
     */  
    function VK_getAllImg( $options = []){
        $data = [
            "owner_id"=>-static::OWNER_ID,
            "v"=> static::VERSION,
            "no_service_albums"=>0,
            "need_hidden"=>1,
            "count"=>100
        ];
        $data = array_merge($data,$options);
        $response = $this->vk->photos()->getAll($this->token, $data);
        return $response;
    }
    /**
     * Возвращает друзей пользователя
     * @param array $options параметры
     * @return array
     */ 
    function VK_getFriends($options = []){
        $data = [
            "count"=>5000,
            "v"=> static::VERSION,
            //"user_id"=>static::USER_ID
            //"fields"=>"nickname,domain,sex,bdate,city,country,timezone,photo_50,photo_100,photo_200_orig,has_mobile,contacts,education,online,relation,last_seen,status,can_write_private_message,can_see_all_posts,can_post,universitie",
        ];
        $data = array_merge($data,$options);
        $response = $this->vk->friends()->get($this->token, $data);
        return $response;
    }
    /**
     * Возвращает друзей пользователя
     * @param array $options параметры
     * @return array
     */ 
    function VK_groupInvite($options = []){
        $data = [
            "group_id"=>static::OWNER_ID,
            "user_id"=>static::USER_ID,
        ];
        $data = array_merge($data,$options);
        $response = $this->vk->groups()->invite($this->token, $data);
        return $response;
    }
    /**
     * Возвращает является ли пользователями участниками группы
     * @param array $options параметры
     * @return array
     */ 
    function VK_groupIsMember($options = []){
        $result = [];
        $data = [
            "group_id"=>static::OWNER_ID,
            "extended"=>1,
            "user_ids"=>[static::USER_ID]
        ];
        $data = array_merge($data,$options);
        if (is_array($data['user_ids']) && !empty($data['user_ids'])) {
            $ids = array_chunk($data['user_ids'], 500);
            foreach ($ids as $block_id) {
                $data['user_ids'] = $block_id;
                $response = $this->vk->groups()->isMember($this->token, $data);
                $result = array_merge($result,$response);
            }
        }
        
        return $result;
    }
    /**
     * Выводит json строку
     * @param array $data данные
     * @param array $ret возвращать значение
     * @return json|null
     */  
    function json_encode($data = [],$ret = false){
        $e = json_encode($data,JSON_UNESCAPED_UNICODE| JSON_UNESCAPED_SLASHES);
        if ($ret) return $e;
        echo $e;
    }
}

?>