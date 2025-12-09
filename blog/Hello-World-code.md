---
title: 各种语言打印 Hello World
slug: Hello-World-code
authors: zyhgov
description: 各种语言打印 Hello World，涵盖了 40 种 主流和常见编程语言！
date: 2025-12-09
---

# 所有主流编程语言的 Hello World 代码

## 1. Python
```python
print("Hello World")
```

<!-- truncate -->

## 2. JavaScript
```javascript
console.log("Hello World");
```

## 3. Java
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
```

## 4. C
```c
#include <stdio.h>

int main() {
    printf("Hello World\n");
    return 0;
}
```

## 5. C++
```cpp
#include <iostream>

int main() {
    std::cout << "Hello World" << std::endl;
    return 0;
}
```

## 6. C#
```csharp
Console.WriteLine("Hello World");
```

## 7. Go
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello World")
}
```

## 8. Rust
```rust
fn main() {
    println!("Hello World");
}
```

## 9. Ruby
```ruby
puts "Hello World"
```

## 10. PHP
```php
<?php
echo "Hello World";
?>
```

## 11. Swift
```swift
print("Hello World")
```

## 12. Kotlin
```kotlin
fun main() {
    println("Hello World")
}
```

## 13. TypeScript
```typescript
console.log("Hello World");
```

## 14. R
```r
print("Hello World")
```

## 15. Perl
```perl
print "Hello World\n";
```

## 16. Scala
```scala
object HelloWorld extends App {
    println("Hello World")
}
```

## 17. Lua
```lua
print("Hello World")
```

## 18. Shell (Bash)
```bash
echo "Hello World"
```

## 19. PowerShell
```powershell
Write-Host "Hello World"
```

## 20. SQL
```sql
SELECT 'Hello World';
```

## 21. MATLAB
```matlab
disp('Hello World')
```

## 22. Objective-C
```objc
#import <Foundation/Foundation.h>

int main() {
    NSLog(@"Hello World");
    return 0;
}
```

## 23. Dart
```dart
void main() {
    print('Hello World');
}
```

## 24. Julia
```julia
println("Hello World")
```

## 25. Haskell
```haskell
main = putStrLn "Hello World"
```

## 26. Elixir
```elixir
IO.puts "Hello World"
```

## 27. Clojure
```clojure
(println "Hello World")
```

## 28. F#
```fsharp
printfn "Hello World"
```

## 29. Erlang
```erlang
-module(hello).
-export([world/0]).

world() -> io:fwrite("Hello World\n").
```

## 30. Assembly (x86 Linux)
```asm
section .data
    msg db 'Hello World', 0xa
    len equ $ - msg

section .text
    global _start

_start:
    mov eax, 4
    mov ebx, 1
    mov ecx, msg
    mov edx, len
    int 0x80
    
    mov eax, 1
    xor ebx, ebx
    int 0x80
```

## 31. COBOL
```cobol
IDENTIFICATION DIVISION.
PROGRAM-ID. HELLO-WORLD.
PROCEDURE DIVISION.
    DISPLAY "Hello World".
    STOP RUN.
```

## 32. Fortran
```fortran
program hello
    print *, "Hello World"
end program hello
```

## 33. Pascal
```pascal
program HelloWorld;
begin
    writeln('Hello World');
end.
```

## 34. Lisp
```lisp
(print "Hello World")
```

## 35. Prolog
```prolog
:- initialization(main).
main :- write('Hello World'), nl.
```

## 36. HTML (网页显示)
```html
<!DOCTYPE html>
<html>
<body>
    <h1>Hello World</h1>
</body>
</html>
```

## 37. CSS (伪代码显示)
```css
body::before {
    content: "Hello World";
}
```

## 38. Groovy
```groovy
println "Hello World"
```

## 39. VB.NET
```vbnet
Module HelloWorld
    Sub Main()
        Console.WriteLine("Hello World")
    End Sub
End Module
```

## 40. Zig
```zig
const std = @import("std");

pub fn main() void {
    std.debug.print("Hello World\n", .{});
}
```

---

:::info
📝 **总结**: 以上涵盖了 **40 种** 主流和常见编程语言！
:::