namespace CSWinFormLayeredWindow
{
    partial class PerPixelAlphaForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.SuspendLayout();
            // 
            // PerPixelAlphaForm
            // 
            this.AllowDrop = true;
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(292, 273);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.None;
            this.Name = "PerPixelAlphaForm";
            this.ShowInTaskbar = false;
            this.Text = "PerPixelAlphaForm";
            this.TopMost = true;
            this.DragDrop += new System.Windows.Forms.DragEventHandler(this.PerPixelAlphaForm_DragDrop);
            this.DragEnter += new System.Windows.Forms.DragEventHandler(this.PerPixelAlphaForm_DragEnter);
            this.Resize += new System.EventHandler(this.PerPixelAlphaForm_Resize);
            this.ResumeLayout(false);

        }

        #endregion
    }
}