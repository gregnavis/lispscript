(defun compile-expr ())

(defun compile-fn (name)
  "Translates a LispScript function name to a JavaScript function name."
  (cond ((symbolp name) (write-to-string name))
        ((listp name) (format nil "~{~a~^.~}" name))
        (t (error "invalid function name"))))

(defun compile-args (args)
  "Translates a LispScript arguments list to a JavaScript arguments string."
  (format nil "~{~a~^,~}" (mapcar #'compile-expr args)))

(defun compile-integer (expr)
  "Translates a LispScript integer literal into a JavaScript integer literal."
  (write-to-string expr))

(defun compile-string (expr)
  "Translates a LispScript string literal into a JavaScript string literal."
  (format nil "\"~a\"" expr))

(defun compile-list (expr)
  "Translates a LispScript list into a JavaScript function call."
  (let ((fn (first expr))
        (args (rest expr)))
    (format nil "~a(~a)" (compile-fn fn) (compile-args args))))

(defun compile-expr (expr)
  "Translates a LispScript expression into a JavaScript expression."
  (cond ((integerp expr) (compile-integer expr))
        ((stringp expr) (compile-string expr))
        ((listp expr) (compile-list expr))
        (t (error "invalid expression"))))

(setf (readtable-case *readtable*) :preserve)
(FORMAT T "~a~%" (COMPILE-EXPR (READ)))
