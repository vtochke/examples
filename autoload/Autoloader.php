<?
/**
 * Класс автозагрузки
 */
class Autoloader
{
    /**
     * Путь для автозагрузки по умолчанию
     *
     * @var string
     */
    protected static $_autoloadRootPath = [
        __DIR__.DIRECTORY_SEPARATOR
    ];

    /**
     * Метод для изменения пути
     *
     * @param string $root_path
     * @return void
     */
    public static function setRootPath($root_path)
    {
        self::$_autoloadRootPath = $root_path;
    }
	
    /**
     * Метод для рекурсивного поиска класса в разделе
     *
     * @param string $className имя класса
     * @param string $directoryPath абсолютный путь раздела
     * @return mixed string|boolean путь или false
     **/
    protected static function searchClassRecursive($className, $directoryPath)
    {
        $classPath = $directoryPath . $className . '.php';
        if (file_exists($classPath)) {
            return $classPath;
        } elseif ($directoryItems = scandir($directoryPath)) {
            foreach ($directoryItems as $item) {
                if ($item == '.' || $item == '..') {
                    continue;
                }
                if (is_dir($directoryPath . $item)) {
                    if ($recursiveResult = self::searchClassRecursive($className, $directoryPath . $item . DIRECTORY_SEPARATOR)) {
                        return $recursiveResult;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Метод загрузки по неймспейсу
     *
     * @param string $name
     * @return boolean
     */
    public static function loadByNamespace($className)
    {
        $class_path = str_replace('\\', DIRECTORY_SEPARATOR, $className);
        
        foreach (self::$_autoloadRootPath as $directory) {
            
            if (stristr(ROOT, $directory))
                $directory = ROOT . $directory;
            if ($classPath = self::searchClassRecursive($class_path, $directory)) {
                require_once($classPath);
                return true;
            }
        }
        return false;
    }
}

spl_autoload_register('Autoloader::loadByNamespace');
?>